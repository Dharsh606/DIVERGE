package services

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
)

type itunesSearchResult struct {
	ResultCount int `json:"resultCount"`
	Results     []struct {
		TrackID          int64  `json:"trackId"`
		TrackName        string `json:"trackName"`
		ArtistName       string `json:"artistName"`
		ArtistID         int64  `json:"artistId"`
		CollectionName   string `json:"collectionName"`
		CollectionID     int64  `json:"collectionId"`
		PrimaryGenreName string `json:"primaryGenreName"`
		PreviewURL       string `json:"previewUrl"`
		ArtworkUrl100    string `json:"artworkUrl100"`
		TrackTimeMillis  int    `json:"trackTimeMillis"`
		ReleaseDate      string `json:"releaseDate"`
		IsStreamable     bool   `json:"isStreamable"`
	} `json:"results"`
}

type parsedYTTrack struct {
	VideoID         string
	Title           string
	Artist          string
	CoverURL        string
	DurationSeconds int
}

// SearchCatalog queries YouTube Music InnerTube (with iTunes fallback) for songs,
// calculates Sound Canvas coordinates, upserts them into PostgreSQL, and returns full models.
func SearchCatalog(query string, limit int) ([]models.Song, error) {
	if limit <= 0 || limit > 30 {
		limit = 20
	}
	cleanQuery := strings.TrimSpace(query)
	if cleanQuery == "" {
		cleanQuery = "Indian Top Hits"
	}

	// 1. Try high-speed YouTube Music InnerTube search first
	ytTracks, err := searchYouTubeInnerTube(cleanQuery, limit)
	if err == nil && len(ytTracks) > 0 {
		var results []models.Song
		for _, item := range ytTracks {
			externalID := fmt.Sprintf("yt-%s", item.VideoID)

			var existingSong models.Song
			if err := database.DB.Preload("Artist").Preload("Album").
				Where("jamendo_id = ?", externalID).First(&existingSong).Error; err == nil {
				results = append(results, existingSong)
				continue
			}

			// Upsert Artist
			artist := models.Artist{
				Name:      item.Artist,
				JamendoID: fmt.Sprintf("yt-artist-%s", item.Artist),
				ImageURL:  item.CoverURL,
				Bio:       fmt.Sprintf("%s is a featured artist in DIVERGE's global & Indian catalog.", item.Artist),
			}
			database.DB.Where("jamendo_id = ?", artist.JamendoID).FirstOrCreate(&artist)

			// Upsert Album
			album := models.Album{
				Title:       item.Title + " - Single",
				ArtistID:    artist.ID,
				CoverURL:    item.CoverURL,
				ReleaseYear: time.Now().Year(),
				JamendoID:   fmt.Sprintf("yt-album-%s", item.VideoID),
			}
			database.DB.Where("jamendo_id = ?", album.JamendoID).FirstOrCreate(&album)

			// Calculate Sound Canvas coordinates & Track DNA parameters
			genre := "Soundtrack"
			if strings.Contains(strings.ToLower(cleanQuery), "punjabi") {
				genre = "Punjabi"
			} else if strings.Contains(strings.ToLower(cleanQuery), "tamil") {
				genre = "Tamil Hits"
			}
			bpm := estimateBPM(genre, item.Title)
			energy := computeCatalogEnergy(bpm, genre)
			mood := computeCatalogMood(genre, item.Title)
			tempoCat := computeCatalogTempo(bpm)
			musicalKey := estimateKey(int64(len(item.VideoID) * 73))

			song := models.Song{
				Title:           item.Title,
				AlbumID:         album.ID,
				ArtistID:        artist.ID,
				DurationSeconds: item.DurationSeconds,
				AudioURL:        fmt.Sprintf("youtube:%s", item.VideoID),
				YouTubeID:       item.VideoID,
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

		if len(results) > 0 {
			return results, nil
		}
	}

	// 2. Fallback to iTunes search API
	searchURL := fmt.Sprintf(
		"https://itunes.apple.com/search?term=%s&entity=song&limit=%d",
		url.QueryEscape(cleanQuery), limit,
	)

	client := &http.Client{Timeout: 5 * time.Second}
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

		var existingSong models.Song
		if err := database.DB.Preload("Artist").Preload("Album").
			Where("jamendo_id = ?", externalID).First(&existingSong).Error; err == nil {
			results = append(results, existingSong)
			continue
		}

		hdCover := strings.Replace(item.ArtworkUrl100, "100x100bb.jpg", "600x600bb.jpg", 1)
		if hdCover == "" {
			hdCover = item.ArtworkUrl100
		}

		artist := models.Artist{
			Name:      item.ArtistName,
			JamendoID: fmt.Sprintf("itunes-artist-%d", item.ArtistID),
			ImageURL:  hdCover,
			Bio:       fmt.Sprintf("%s is a featured artist in DIVERGE's global & Indian catalog.", item.ArtistName),
		}
		database.DB.Where("jamendo_id = ?", artist.JamendoID).FirstOrCreate(&artist)

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

		genre := item.PrimaryGenreName
		if genre == "" {
			genre = "Pop"
		}
		bpm := estimateBPM(genre, item.TrackName)
		energy := computeCatalogEnergy(bpm, genre)
		mood := computeCatalogMood(genre, item.TrackName)
		tempoCat := computeCatalogTempo(bpm)
		musicalKey := estimateKey(item.TrackID)

		song := models.Song{
			Title:           item.TrackName,
			AlbumID:         album.ID,
			ArtistID:        artist.ID,
			DurationSeconds: item.TrackTimeMillis / 1000,
			AudioURL:        item.PreviewURL,
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

func searchYouTubeInnerTube(query string, limit int) ([]parsedYTTrack, error) {
	payload := map[string]interface{}{
		"context": map[string]interface{}{
			"client": map[string]interface{}{
				"clientName":    "WEB",
				"clientVersion": "2.20240101.01.00",
				"hl":            "en",
				"gl":            "IN",
			},
		},
		"query": fmt.Sprintf("%s song", query),
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://www.youtube.com/youtubei/v1/search", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("youtube returned status %d", resp.StatusCode)
	}

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	var tracks []parsedYTTrack
	seen := make(map[string]bool)

	contents, ok := digMap(data, "contents", "twoColumnSearchResultsRenderer", "primaryContents", "sectionListRenderer", "contents").([]interface{})
	if !ok || len(contents) == 0 {
		return nil, fmt.Errorf("no search results in response")
	}

	itemSection, ok := contents[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid section format")
	}
	items, ok := digMap(itemSection, "itemSectionRenderer", "contents").([]interface{})
	if !ok {
		return nil, fmt.Errorf("no item renderer contents")
	}

	for _, itemRaw := range items {
		itMap, ok := itemRaw.(map[string]interface{})
		if !ok {
			continue
		}
		v, ok := itMap["videoRenderer"].(map[string]interface{})
		if !ok {
			continue
		}

		videoID, _ := v["videoId"].(string)
		if videoID == "" || seen[videoID] {
			continue
		}

		title := ""
		if tObj, ok := v["title"].(map[string]interface{}); ok {
			if runs, ok := tObj["runs"].([]interface{}); ok && len(runs) > 0 {
				if rMap, ok := runs[0].(map[string]interface{}); ok {
					title, _ = rMap["text"].(string)
				}
			}
		}

		artist := "DIVERGE Artist"
		if oObj, ok := v["ownerText"].(map[string]interface{}); ok {
			if runs, ok := oObj["runs"].([]interface{}); ok && len(runs) > 0 {
				if rMap, ok := runs[0].(map[string]interface{}); ok {
					artist, _ = rMap["text"].(string)
				}
			}
		}

		durStr := ""
		if lenObj, ok := v["lengthText"].(map[string]interface{}); ok {
			durStr, _ = lenObj["simpleText"].(string)
		}
		durationSec := parseDurString(durStr)
		if durationSec > 900 {
			// Skip full length movies
			continue
		}

		coverURL := fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", videoID)

		seen[videoID] = true
		tracks = append(tracks, parsedYTTrack{
			VideoID:         videoID,
			Title:           cleanSongTitle(title),
			Artist:          artist,
			CoverURL:        coverURL,
			DurationSeconds: durationSec,
		})

		if len(tracks) >= limit {
			break
		}
	}

	return tracks, nil
}

func parseDurString(text string) int {
	if text == "" {
		return 210
	}
	parts := strings.Split(text, ":")
	if len(parts) == 2 {
		m, _ := strconv.Atoi(parts[0])
		s, _ := strconv.Atoi(parts[1])
		return m*60 + s
	} else if len(parts) == 3 {
		h, _ := strconv.Atoi(parts[0])
		m, _ := strconv.Atoi(parts[1])
		s, _ := strconv.Atoi(parts[2])
		return h*3600 + m*60 + s
	}
	return 210
}

func cleanSongTitle(raw string) string {
	if raw == "" {
		return "Untitled Track"
	}
	re := regexp.MustCompile(`(?i)\s*[\(\[]\s*(official|music|video|audio|lyric|hd|4k|full song|original|remastered).+?[\)\]]`)
	cleaned := re.ReplaceAllString(raw, "")
	return strings.TrimSpace(cleaned)
}

func digMap(m map[string]interface{}, keys ...string) interface{} {
	var current interface{} = m
	for _, k := range keys {
		currMap, ok := current.(map[string]interface{})
		if !ok {
			return nil
		}
		current = currMap[k]
	}
	return current
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
