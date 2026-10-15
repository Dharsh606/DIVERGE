package handlers

import (
	"strings"
	"time"

	"github.com/diverge/backend/database"
	"github.com/diverge/backend/middleware"
	"github.com/diverge/backend/models"
	"github.com/gofiber/fiber/v2"
)

// POST /api/history — log a play event
func LogHistory(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var input struct {
		SongID              uint   `json:"song_id"`
		PlayDurationSeconds int    `json:"play_duration_seconds"`
		Completed           bool   `json:"completed"`
		ContextTags         string `json:"context_tags"`
	}
	if err := c.BodyParser(&input); err != nil || input.SongID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "song_id required"})
	}

	history := models.ListeningHistory{
		UserID:              userID,
		SongID:              input.SongID,
		PlayedAt:            time.Now(),
		PlayDurationSeconds: input.PlayDurationSeconds,
		Completed:           input.Completed,
		ContextTags:         input.ContextTags,
	}
	database.DB.Create(&history)
	return c.Status(fiber.StatusCreated).JSON(history)
}

type TraceEntry struct {
	ID          uint      `json:"id"`
	SongID      uint      `json:"song_id"`
	Title       string    `json:"title"`
	ArtistName  string    `json:"artist_name"`
	CoverURL    string    `json:"cover_url"`
	Genre       string    `json:"genre"`
	PlayedAt    time.Time `json:"played_at"`
	ContextTags string    `json:"context_tags"`
}

// GET /api/history/trace — branching structure for Trace visualiser
func GetTrace(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var entries []TraceEntry
	database.DB.Raw(`
		SELECT lh.id, lh.song_id, s.title, a.name as artist_name,
		       al.cover_url, s.genre, lh.played_at, lh.context_tags
		FROM listening_histories lh
		JOIN songs s ON s.id = lh.song_id
		JOIN artists a ON a.id = s.artist_id
		LEFT JOIN albums al ON al.id = s.album_id
		WHERE lh.user_id = ?
		ORDER BY lh.played_at DESC
		LIMIT 200
	`, userID).Scan(&entries)

	// Build branching structure: group by genre shifts
	nodes := buildTraceNodes(entries)
	return c.JSON(fiber.Map{"nodes": nodes, "total": len(entries)})
}

type TraceNode struct {
	ID          uint        `json:"id"`
	SongID      uint        `json:"song_id"`
	Title       string      `json:"title"`
	ArtistName  string      `json:"artist_name"`
	CoverURL    string      `json:"cover_url"`
	Genre       string      `json:"genre"`
	PlayedAt    time.Time   `json:"played_at"`
	ContextTags []string    `json:"context_tags"`
	ParentID    *uint       `json:"parent_id"`
	Depth       int         `json:"depth"`
	IsBranch    bool        `json:"is_branch"` // true = genre shift happened here
}

func buildTraceNodes(entries []TraceEntry) []TraceNode {
	nodes := make([]TraceNode, 0, len(entries))
	var lastGenre string
	var parentID *uint
	depth := 0

	for i, e := range entries {
		isBranch := i > 0 && e.Genre != lastGenre && e.Genre != ""
		if isBranch {
			depth++
		}

		var pid *uint
		if i > 0 {
			prevID := nodes[i-1].ID
			pid = &prevID
		}
		_ = parentID // suppress unused warning

		tags := []string{}
		if e.ContextTags != "" {
			tags = strings.Split(e.ContextTags, ",")
		}

		node := TraceNode{
			ID:          e.ID,
			SongID:      e.SongID,
			Title:       e.Title,
			ArtistName:  e.ArtistName,
			CoverURL:    e.CoverURL,
			Genre:       e.Genre,
			PlayedAt:    e.PlayedAt,
			ContextTags: tags,
			ParentID:    pid,
			Depth:       depth,
			IsBranch:    isBranch,
		}
		nodes = append(nodes, node)
		lastGenre = e.Genre
		parentID = &node.ID
	}
	return nodes
}

// GET /api/tags
func GetContextTags(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var tags []models.ContextTag
	database.DB.Preload("Song.Artist").Where("user_id = ?", userID).
		Order("created_at DESC").Find(&tags)
	return c.JSON(tags)
}

// POST /api/tags
func AddContextTag(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var input struct {
		SongID  uint   `json:"song_id"`
		TagName string `json:"tag_name"`
	}
	if err := c.BodyParser(&input); err != nil || input.SongID == 0 || input.TagName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "song_id and tag_name required"})
	}

	tag := models.ContextTag{
		UserID:  userID,
		SongID:  input.SongID,
		TagName: strings.TrimSpace(input.TagName),
	}
	database.DB.Create(&tag)
	return c.Status(fiber.StatusCreated).JSON(tag)
}

// DELETE /api/tags/:id
func DeleteContextTag(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	id := c.Params("id")
	var tag models.ContextTag
	if result := database.DB.First(&tag, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Tag not found"})
	}
	if tag.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}
	database.DB.Delete(&tag)
	return c.JSON(fiber.Map{"message": "Tag deleted"})
}

// GET /api/recommendations/context?tag=Morning
func GetContextRecommendations(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	tag := c.Query("tag")
	if tag == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "tag query param required"})
	}

	var songIDs []uint
	database.DB.Model(&models.ContextTag{}).
		Where("user_id = ? AND tag_name = ?", userID, tag).
		Pluck("song_id", &songIDs)

	if len(songIDs) == 0 {
		return c.JSON([]models.Song{})
	}

	var songs []models.Song
	database.DB.Preload("Artist").Preload("Album").Where("id IN ?", songIDs).Find(&songs)
	return c.JSON(songs)
}
