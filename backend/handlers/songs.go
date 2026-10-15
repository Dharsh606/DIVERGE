package handlers

import (
	"strconv"

	"github.com/diverge/backend/database"
	"github.com/diverge/backend/middleware"
	"github.com/diverge/backend/models"
	"github.com/gofiber/fiber/v2"
)

// GET /api/songs?page=1&limit=20&genre=pop&search=title
func GetSongs(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if limit > 50 {
		limit = 50
	}
	offset := (page - 1) * limit

	query := database.DB.Preload("Artist").Preload("Album")

	if genre := c.Query("genre"); genre != "" {
		query = query.Where("genre = ?", genre)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("songs.title ILIKE ? OR EXISTS (SELECT 1 FROM artists WHERE artists.id = songs.artist_id AND artists.name ILIKE ?)",
			"%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Model(&models.Song{}).Count(&total)

	var songs []models.Song
	query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&songs)

	return c.JSON(fiber.Map{
		"songs": songs,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GET /api/songs/:id
func GetSong(c *fiber.Ctx) error {
	id := c.Params("id")
	var song models.Song
	if result := database.DB.Preload("Artist").Preload("Album").First(&song, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Song not found"})
	}
	return c.JSON(song)
}

// GET /api/songs/:id/dna — Track DNA data for generative glyph
func GetSongDNA(c *fiber.Ctx) error {
	id := c.Params("id")
	var song models.Song
	if result := database.DB.Select("id, bpm, musical_key, energy_score, mood_score, tempo_category, genre").
		First(&song, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Song not found"})
	}
	return c.JSON(fiber.Map{
		"id":             song.ID,
		"bpm":            song.BPM,
		"musical_key":    song.MusicalKey,
		"energy_score":   song.EnergyScore,
		"mood_score":     song.MoodScore,
		"tempo_category": song.TempoCategory,
		"genre":          song.Genre,
	})
}

// GET /api/songs/:id/stream — Audio streaming with Range support
func StreamSong(c *fiber.Ctx) error {
	id := c.Params("id")
	var song models.Song
	if result := database.DB.Select("id, audio_url, file_path, file_size, title").
		First(&song, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Song not found"})
	}

	// Log the play event if user is authenticated
	if userID, ok := middleware.GetUserID(c); ok {
		go logPlay(userID, song.ID)
	}

	// If we have a local file, serve it with Range support
	if song.FilePath != "" {
		return c.SendFile(song.FilePath)
	}

	// Otherwise redirect to Jamendo stream URL
	if song.AudioURL != "" {
		return c.Redirect(song.AudioURL, fiber.StatusFound)
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Audio not available"})
}

// GET /api/songs/trending
func GetTrending(c *fiber.Ctx) error {
	var songs []models.Song
	// Most played in last 7 days
	database.DB.Preload("Artist").Preload("Album").
		Joins("LEFT JOIN listening_histories ON listening_histories.song_id = songs.id AND listening_histories.played_at > NOW() - INTERVAL '7 days'").
		Group("songs.id").
		Order("COUNT(listening_histories.id) DESC").
		Limit(20).
		Find(&songs)
	return c.JSON(songs)
}

// GET /api/genres
func GetGenres(c *fiber.Ctx) error {
	var genres []string
	database.DB.Model(&models.Song{}).Distinct("genre").Where("genre != ''").Pluck("genre", &genres)
	return c.JSON(genres)
}

func logPlay(userID, songID uint) {
	database.DB.Create(&models.ListeningHistory{
		UserID:   userID,
		SongID:   songID,
		Completed: false,
	})
}
