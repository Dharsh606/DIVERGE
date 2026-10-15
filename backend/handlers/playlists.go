package handlers

import (
	"math/rand"
	"strconv"
	"time"

	"github.com/diverge/backend/database"
	"github.com/diverge/backend/middleware"
	"github.com/diverge/backend/models"
	"github.com/gofiber/fiber/v2"
)

// GET /api/playlists — current user's playlists
func GetPlaylists(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var playlists []models.Playlist
	database.DB.Where("user_id = ?", userID).Order("updated_at DESC").Find(&playlists)
	return c.JSON(playlists)
}

// POST /api/playlists
func CreatePlaylist(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IsPublic    bool   `json:"is_public"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}
	if input.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Playlist name is required"})
	}

	playlist := models.Playlist{
		UserID:      userID,
		Name:        input.Name,
		Description: input.Description,
		IsPublic:    input.IsPublic,
		ShareToken:  generateShareToken(8),
	}
	database.DB.Create(&playlist)
	return c.Status(fiber.StatusCreated).JSON(playlist)
}

// GET /api/playlists/:id
func GetPlaylist(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, _ := middleware.GetUserID(c)

	var playlist models.Playlist
	if result := database.DB.Preload("Songs.Artist").Preload("Songs.Album").Preload("User").
		First(&playlist, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found"})
	}

	// Allow access if owner or public
	if playlist.UserID != userID && !playlist.IsPublic {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}
	return c.JSON(playlist)
}

// PUT /api/playlists/:id
func UpdatePlaylist(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	id := c.Params("id")
	var playlist models.Playlist
	if result := database.DB.First(&playlist, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found"})
	}
	if playlist.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IsPublic    bool   `json:"is_public"`
	}
	c.BodyParser(&input)
	if input.Name != "" {
		playlist.Name = input.Name
	}
	playlist.Description = input.Description
	playlist.IsPublic = input.IsPublic
	database.DB.Save(&playlist)
	return c.JSON(playlist)
}

// DELETE /api/playlists/:id
func DeletePlaylist(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	id := c.Params("id")
	var playlist models.Playlist
	if result := database.DB.First(&playlist, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found"})
	}
	if playlist.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}
	database.DB.Delete(&playlist)
	database.DB.Where("playlist_id = ?", playlist.ID).Delete(&models.PlaylistSong{})
	return c.JSON(fiber.Map{"message": "Playlist deleted"})
}

// POST /api/playlists/:id/songs
func AddSongToPlaylist(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	playlistID, _ := strconv.Atoi(c.Params("id"))
	var input struct {
		SongID uint `json:"song_id"`
	}
	if err := c.BodyParser(&input); err != nil || input.SongID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "song_id required"})
	}

	var playlist models.Playlist
	if result := database.DB.First(&playlist, playlistID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found"})
	}
	if playlist.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	// Get next position
	var maxPos struct{ Max int }
	database.DB.Model(&models.PlaylistSong{}).Select("COALESCE(MAX(position), 0) as max").
		Where("playlist_id = ?", playlistID).Scan(&maxPos)

	ps := models.PlaylistSong{
		PlaylistID: uint(playlistID),
		SongID:     input.SongID,
		Position:   maxPos.Max + 1,
		AddedAt:    time.Now(),
	}
	database.DB.Create(&ps)
	return c.Status(fiber.StatusCreated).JSON(ps)
}

// DELETE /api/playlists/:id/songs/:songId
func RemoveSongFromPlaylist(c *fiber.Ctx) error {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	playlistID := c.Params("id")
	songID := c.Params("songId")

	var playlist models.Playlist
	if result := database.DB.First(&playlist, playlistID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found"})
	}
	if playlist.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	database.DB.Where("playlist_id = ? AND song_id = ?", playlistID, songID).Delete(&models.PlaylistSong{})
	return c.JSON(fiber.Map{"message": "Song removed"})
}

// GET /api/share/playlist/:token — public, no auth required
func GetPlaylistByShareToken(c *fiber.Ctx) error {
	token := c.Params("token")
	var playlist models.Playlist
	if result := database.DB.Preload("Songs.Artist").Preload("Songs.Album").Preload("User").
		Where("share_token = ? AND is_public = true", token).First(&playlist); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Playlist not found or not public"})
	}
	return c.JSON(playlist)
}

func generateShareToken(length int) string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = chars[r.Intn(len(chars))]
	}
	return string(b)
}
