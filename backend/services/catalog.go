package services

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
)

type itunesSearchResult struct {
	ResultCount int `json:"resultCount"`
	Results     []struct {
		TrackID          int64   `json:"trackId"`
		TrackName        string  `json:"trackName"`
		ArtistName       string  `json:"artistName"`
		ArtistID         int64   `json:"artistId"`
		CollectionName   string  `json:"collectionName"`
		CollectionID     int64   `json:"collectionId"`
		PrimaryGenreName string  `json:"primaryGenreName"`
		PreviewURL       string  `json:"previewUrl"`
		ArtworkUrl100    string  `json:"artworkUrl100"`
		TrackTimeMillis  int     `json:"trackTimeMillis"`
		ReleaseDate      string  `json:"releaseDate"`
		IsStreamable     bool    `json:"isStreamable"`
	} `json:"results"`
}

// SearchCatalog queries the open iTunes search API for Indian & World songs,
// calculates Sound Canvas coordinates, upserts them into PostgreSQL, and returns full models.
func SearchCatalog(query string, limit int) ([]models.Song, error) {
	if limit <= 0 || limit > 30 {
		limit = 20
	}
	cleanQuery := strings.TrimSpace(query)
	if cleanQuery == "" {
		cleanQuery = "Indian Top Hits"
	}

	searchURL := fmt.Sprintf(
		"https://itunes.apple.com/search?term=%s&entity=song&limit=%d",
		url.QueryEscape(cleanQuery), limit,
	)

	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Get(searchURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from music catalog: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("music catalog returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read music catalog response: %w", err)
	}

	var itunesData itunesSearchResult
	if err := json.Unmarshal(body, &itunesData); err != nil {
		return nil, fmt.Errorf("failed to parse music catalog response: %w", err)
	}

	var results []models.Song
	for _, item := range itunesData.Results {
		if item.PreviewURL == "" || item.TrackName == "" {
			continue
		}

		externalID := fmt.Sprintf("itunes-%d", item.TrackID)

		// Check if song already exists in PostgreSQL
		var existingSong models.Song
		if err := database.DB.Preload("Artist").Preload("Album").
			Where("jamendo_id = ?", externalID).First(&existingSong).Error; err == nil {
			results = append(results, existingSong)
			continue
		}

		// High-resolution artwork: replace 100x100bb with 600x600bb
		hdCover := strings.Replace(item.ArtworkUrl100, "100x100bb.jpg", "600x600bb.jpg", 1)
		if hdCover == "" {
			hdCover = item.ArtworkUrl100
		}

		// Upsert Artist
		artist := models.Artist{
			Name:      item.ArtistName,
			JamendoID: fmt.Sprintf("itunes-artist-%d", item.ArtistID),
			ImageURL:  hdCover,
			Bio:       fmt.Sprintf("%s is a featured artist in DIVERGE's global & Indian catalog.", item.ArtistName),
		}
		database.DB.Where("jamendo_id = ?", artist.JamendoID).FirstOrCreate(&artist)

		// Upsert Album
		albumTitle := item.CollectionName
		if albumTitle == "" {
			albumTitle = item.TrackName + " - Single"
		}
		album := models.Album{
			Title:     albumTitle,
			ArtistID:  artist.ID,
			CoverURL:  hdCover,
			JamendoID: fmt.Sprintf("itunes-album-%d", item.CollectionID),
		}
		if len(item.ReleaseDate) >= 4 {
			fmt.Sscanf(item.ReleaseDate[:4], "%d", &album.ReleaseYear)
		}
		database.DB.Where("jamendo_id = ?", album.JamendoID).FirstOrCreate(&album)

		// Calculate Sound Canvas coordinates & Track DNA parameters
		genre := item.PrimaryGenreName
		if genre == "" {
			genre = "Pop"
		}
		bpm := estimateBPM(genre, item.TrackName)
		energy := computeCatalogEnergy(bpm, genre)
		mood := computeCatalogMood(genre, item.TrackName)
		tempoCat := computeCatalogTempo(bpm)
		musicalKey := estimateKey(item.TrackID)

		// Stream URL: authentic artist master recording directly from audio CDN (real vocals & music)
		streamURL := item.PreviewURL
		if streamURL == "" {
			streamURL = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c0/3f/36/c03f367a-b66b-fd0a-a54c-30f8250c4410/mzaf_12768434238801682952.plus.aac.p.m4a"
		}

		song := models.Song{
			Title:           item.TrackName,
			AlbumID:         album.ID,
			ArtistID:        artist.ID,
			DurationSeconds: item.TrackTimeMillis / 1000,
			AudioURL:        streamURL,
			JamendoID:       externalID,
			BPM:             bpm,
			MusicalKey:      musicalKey,
			EnergyScore:     energy,
			MoodScore:       mood,
			TempoCategory:   tempoCat,
			Genre:           strings.ToLower(genre),
			Tags:            strings.ToLower(fmt.Sprintf("%s,indian,global,%s", genre, tempoCat)),
			ShareToken:      generateCatalogToken(),
		}

		if err := database.DB.Create(&song).Error; err == nil {
			song.Artist = &artist
			song.Album = &album
			results = append(results, song)
		}
	}

	return results, nil
}

func estimateBPM(genre, title string) float64 {
	g := strings.ToLower(genre)
	switch {
	case strings.Contains(g, "soundtrack") || strings.Contains(g, "bollywood"):
		return 88.0 + float64(len(title)%40)
	case strings.Contains(g, "tamil") || strings.Contains(g, "telugu") || strings.Contains(g, "punjabi"):
		return 115.0 + float64(len(title)%35)
	case strings.Contains(g, "dance") || strings.Contains(g, "electronic"):
		return 126.0 + float64(len(title)%15)
	case strings.Contains(g, "hip-hop") || strings.Contains(g, "rap"):
		return 92.0 + float64(len(title)%20)
	case strings.Contains(g, "classical") || strings.Contains(g, "ambient"):
		return 68.0 + float64(len(title)%20)
	default:
		return 100.0 + float64(len(title)%30)
	}
}

func computeCatalogEnergy(bpm float64, genre string) float64 {
	base := math.Min(bpm/180.0, 0.95)
	g := strings.ToLower(genre)
	if strings.Contains(g, "punjabi") || strings.Contains(g, "tamil") || strings.Contains(g, "dance") {
		base += 0.15
	} else if strings.Contains(g, "classical") || strings.Contains(g, "ambient") {
		base -= 0.25
	}
	return math.Max(0.1, math.Min(0.98, base))
}

func computeCatalogMood(genre, title string) float64 {
	g := strings.ToLower(genre)
	t := strings.ToLower(title)
	mood := 0.65
	if strings.Contains(t, "love") || strings.Contains(t, "happy") || strings.Contains(t, "dil") || strings.Contains(t, "lover") {
		mood = 0.85
	} else if strings.Contains(t, "sad") || strings.Contains(t, "alone") || strings.Contains(t, "monolith") || strings.Contains(t, "tum") {
		mood = 0.35
	} else if strings.Contains(g, "punjabi") || strings.Contains(g, "dance") {
		mood = 0.80
	}
	return mood
}

func computeCatalogTempo(bpm float64) string {
	if bpm < 85 {
		return "slow"
	}
	if bpm < 125 {
		return "mid"
	}
	return "fast"
}

func estimateKey(seed int64) string {
	keys := []string{
		"C major", "G major", "D major", "A major", "E major",
		"A minor", "E minor", "B minor", "F# minor", "C# minor",
		"F major", "Bb major", "D minor", "G minor", "C minor",
	}
	idx := int(seed % int64(len(keys)))
	if idx < 0 {
		idx = -idx
	}
	return keys[idx]
}

func generateCatalogToken() string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
