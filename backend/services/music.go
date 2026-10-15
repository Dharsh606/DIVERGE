package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
)

// ─── Jamendo Seed Service ─────────────────────────────────────────────────────

type jamendoTrack struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Duration      int     `json:"duration"`
	AudioURL      string  `json:"audio"`
	AlbumName     string  `json:"album_name"`
	AlbumImage    string  `json:"album_image"`
	ArtistName    string  `json:"artist_name"`
	ReleaseDate   string  `json:"releasedate"`
	Genre         string  `json:"musicinfo.tags.genres"`
	Tags          string  `json:"tags"`
	BPM           float64 `json:"bpm"`
}

type jamendoResp struct {
	Results []jamendoTrack `json:"results"`
}

// SeedFromJamendo pulls tracks from Jamendo API and stores in DB
func SeedFromJamendo(limit int) error {
	clientID := config.App.JamendoID
	if clientID == "" {
		log.Println("DIVERGE: No Jamendo client_id set, skipping seed")
		return nil
	}

	genres := []string{"pop", "rock", "electronic", "jazz", "classical", "hiphop", "ambient", "folk"}
	totalSeeded := 0

	for _, genre := range genres {
		url := fmt.Sprintf(
			"https://api.jamendo.com/v3.0/tracks/?client_id=%s&format=json&limit=%d&tags=%s&audioformat=mp32&include=musicinfo&groupby=artist_id",
			clientID, limit/len(genres), genre,
		)

		resp, err := http.Get(url)
		if err != nil {
			log.Printf("DIVERGE: Jamendo request failed for genre %s: %v", genre, err)
			continue
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		var jResp struct {
			Results []map[string]interface{} `json:"results"`
		}
		if err := json.Unmarshal(body, &jResp); err != nil {
			continue
		}

		for _, item := range jResp.Results {
			seeded := seedTrack(item, genre)
			if seeded {
				totalSeeded++
			}
		}
	}

	log.Printf("DIVERGE: Seeded %d tracks from Jamendo", totalSeeded)
	return nil
}

func seedTrack(item map[string]interface{}, genre string) bool {
	getString := func(key string) string {
		if v, ok := item[key]; ok {
			if s, ok := v.(string); ok {
				return s
			}
		}
		return ""
	}
	getFloat := func(key string) float64 {
		if v, ok := item[key]; ok {
			switch f := v.(type) {
			case float64:
				return f
			}
		}
		return 0
	}
	getInt := func(key string) int {
		if v, ok := item[key]; ok {
			switch i := v.(type) {
			case float64:
				return int(i)
			}
		}
		return 0
	}

	jamendoID := getString("id")
	if jamendoID == "" {
		return false
	}

	// Skip if already seeded
	var existing models.Song
	if result := database.DB.Where("jamendo_id = ?", jamendoID).First(&existing); result.Error == nil {
		return false
	}

	// Upsert Artist
	artistName := getString("artist_name")
	artist := models.Artist{Name: artistName, JamendoID: getString("artist_id")}
	database.DB.Where("jamendo_id = ?", artist.JamendoID).FirstOrCreate(&artist)

	// Upsert Album
	album := models.Album{
		Title:     getString("album_name"),
		ArtistID:  artist.ID,
		CoverURL:  getString("album_image"),
		JamendoID: getString("album_id"),
	}
	if rd := getString("releasedate"); len(rd) >= 4 {
		fmt.Sscanf(rd[:4], "%d", &album.ReleaseYear)
	}
	database.DB.Where("jamendo_id = ?", album.JamendoID).FirstOrCreate(&album)

	// Compute Sound Canvas / DNA scores
	bpm := getFloat("bpm")
	energy := computeEnergy(bpm, genre)
	mood := computeMood(genre)
	tempoCategory := computeTempoCategory(bpm)

	song := models.Song{
		Title:           getString("name"),
		AlbumID:         album.ID,
		ArtistID:        artist.ID,
		DurationSeconds: getInt("duration"),
		AudioURL:        getString("audio"),
		JamendoID:       jamendoID,
		BPM:             bpm,
		EnergyScore:     energy,
		MoodScore:       mood,
		TempoCategory:   tempoCategory,
		Genre:           genre,
		ShareToken:      generateSongToken(),
	}

	database.DB.Create(&song)
	return true
}

func computeEnergy(bpm float64, genre string) float64 {
	base := math.Min(bpm/200.0, 1.0)
	genreBoost := map[string]float64{
		"electronic": 0.2, "rock": 0.15, "hiphop": 0.1,
		"pop": 0.05, "jazz": -0.1, "classical": -0.15,
		"ambient": -0.25, "folk": -0.05,
	}
	boost := genreBoost[genre]
	return math.Max(0, math.Min(1.0, base+boost))
}

func computeMood(genre string) float64 {
	genreMood := map[string]float64{
		"pop": 0.7, "electronic": 0.6, "rock": 0.5,
		"hiphop": 0.45, "jazz": 0.6, "classical": 0.55,
		"ambient": 0.4, "folk": 0.65,
	}
	if m, ok := genreMood[genre]; ok {
		// Add slight randomness so songs in same genre differ
		return math.Max(0, math.Min(1.0, m+rand.Float64()*0.2-0.1))
	}
	return 0.5
}

func computeTempoCategory(bpm float64) string {
	switch {
	case bpm < 80:
		return "slow"
	case bpm < 120:
		return "mid"
	default:
		return "fast"
	}
}

func generateSongToken() string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 10)
	for i := range b {
		b[i] = chars[r.Intn(len(chars))]
	}
	return string(b)
}

// ─── Recommendation Service ───────────────────────────────────────────────────

type RecommendationResult struct {
	Songs  []models.Song `json:"songs"`
	Reason string        `json:"reason,omitempty"` // Used by Anti-Algorithm
}

// GetRecommendations — standard history-based recommendations
func GetRecommendations(userID uint, limit int) RecommendationResult {
	// Get user's top genres from history
	type GenreCount struct {
		Genre string
		Count int
	}
	var topGenres []GenreCount
	database.DB.Raw(`
		SELECT s.genre, COUNT(*) as count
		FROM listening_histories lh
		JOIN songs s ON s.id = lh.song_id
		WHERE lh.user_id = ? AND s.genre != ''
		GROUP BY s.genre
		ORDER BY count DESC
		LIMIT 3
	`, userID).Scan(&topGenres)

	if len(topGenres) == 0 {
		// New user — return trending
		var songs []models.Song
		database.DB.Preload("Artist").Preload("Album").
			Order("RANDOM()").Limit(limit).Find(&songs)
		return RecommendationResult{Songs: songs}
	}

	genres := make([]string, len(topGenres))
	for i, g := range topGenres {
		genres[i] = g.Genre
	}

	// Get recently played song IDs to exclude
	var recentIDs []uint
	database.DB.Raw(`
		SELECT DISTINCT song_id FROM listening_histories
		WHERE user_id = ? AND played_at > NOW() - INTERVAL '7 days'
	`, userID).Pluck("song_id", &recentIDs)

	var songs []models.Song
	query := database.DB.Preload("Artist").Preload("Album").
		Where("genre IN ?", genres)
	if len(recentIDs) > 0 {
		query = query.Where("id NOT IN ?", recentIDs)
	}
	query.Order("RANDOM()").Limit(limit).Find(&songs)

	return RecommendationResult{Songs: songs}
}

// GetAntiAlgorithmRecommendations — deliberately outside comfort zone
func GetAntiAlgorithmRecommendations(userID uint, limit int) RecommendationResult {
	type ProfileData struct {
		AvgBPM    float64
		TopGenre  string
		AvgEnergy float64
		AvgMood   float64
	}

	var profile ProfileData
	database.DB.Raw(`
		SELECT
			AVG(s.bpm) as avg_bpm,
			AVG(s.energy_score) as avg_energy,
			AVG(s.mood_score) as avg_mood,
			(SELECT genre FROM songs s2
			 JOIN listening_histories lh2 ON lh2.song_id = s2.id
			 WHERE lh2.user_id = ?
			 GROUP BY genre ORDER BY COUNT(*) DESC LIMIT 1) as top_genre
		FROM listening_histories lh
		JOIN songs s ON s.id = lh.song_id
		WHERE lh.user_id = ?
	`, userID, userID).Scan(&profile)

	if profile.AvgBPM == 0 {
		// No history — can't diverge
		var songs []models.Song
		database.DB.Preload("Artist").Preload("Album").Order("RANDOM()").Limit(limit).Find(&songs)
		return RecommendationResult{
			Songs:  songs,
			Reason: "Explore something new — you haven't listened to enough yet to diverge from.",
		}
	}

	// Target the OPPOSITE of user's profile
	targetBPMLow := profile.AvgBPM - 50
	targetBPMHigh := profile.AvgBPM + 50

	var songs []models.Song
	database.DB.Preload("Artist").Preload("Album").
		Where("genre != ? AND (bpm < ? OR bpm > ?) AND ABS(energy_score - ?) > 0.3",
			profile.TopGenre, targetBPMLow, targetBPMHigh, profile.AvgEnergy).
		Order("RANDOM()").
		Limit(limit).
		Find(&songs)

	reason := buildAntiReason(profile.TopGenre, profile.AvgBPM, profile.AvgEnergy)
	return RecommendationResult{Songs: songs, Reason: reason}
}

func buildAntiReason(topGenre string, avgBPM, avgEnergy float64) string {
	parts := []string{}
	if topGenre != "" {
		parts = append(parts, fmt.Sprintf("You mostly listen to %s", strings.Title(topGenre)))
	}
	if avgBPM > 0 {
		parts = append(parts, fmt.Sprintf("Your average BPM is %.0f", avgBPM))
	}
	if avgEnergy > 0.6 {
		parts = append(parts, "and tend to favour high-energy tracks")
	} else if avgEnergy < 0.4 {
		parts = append(parts, "and tend to favour low-energy tracks")
	}
	parts = append(parts, "— so we went the other way.")
	return strings.Join(parts, ". ")
}

// GetSoundCanvasData — returns all songs with their 2D coordinates
func GetSoundCanvasData() []map[string]interface{} {
	var songs []models.Song
	database.DB.Preload("Artist").Select("id, title, artist_id, energy_score, mood_score, bpm, genre, tempo_category").
		Find(&songs)

	result := make([]map[string]interface{}, len(songs))
	for i, s := range songs {
		result[i] = map[string]interface{}{
			"id":       s.ID,
			"title":    s.Title,
			"artist":   s.Artist,
			"x":        s.EnergyScore, // X axis: energy
			"y":        s.MoodScore,   // Y axis: mood/valence
			"bpm":      s.BPM,
			"genre":    s.Genre,
			"tempo":    s.TempoCategory,
		}
	}
	return result
}
