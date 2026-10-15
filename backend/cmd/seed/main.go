package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
)

func randomToken() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func main() {
	config.Load()
	database.Connect()

	// Check if already seeded
	var count int64
	database.DB.Model(&models.Song{}).Count(&count)
	if count >= 18 {
		log.Printf("DIVERGE Seeder: Database already has %d songs. Skipping.", count)
		return
	}

	// Clean partial seed data
	database.DB.Exec("DELETE FROM songs")
	database.DB.Exec("DELETE FROM albums")
	database.DB.Exec("DELETE FROM artists")

	log.Println("DIVERGE Seeder: Seeding curated catalog with rich Sound Canvas and Track DNA profiles...")

	// 1. Artists
	artists := []models.Artist{
		{Name: "Aura Node", Bio: "Atmospheric synthesizer architectures and deep pulse exploration.", ImageURL: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"},
		{Name: "Lumen & The Deep", Bio: "Crescendos of distorted reverb, melancholic harmonics, and kinetic drums.", ImageURL: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&q=80"},
		{Name: "Koto Minimal", Bio: "Organic acoustic textures, piano resonance, and generative calm.", ImageURL: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"},
		{Name: "Signal Void", Bio: "Industrial analog frequencies exploring dark spatial tension.", ImageURL: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80"},
		{Name: "Velvet Orbit", Bio: "Warm tape-saturated chords, vinyl texture, and midnight lo-fi grooves.", ImageURL: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80"},
		{Name: "Hyperion Shift", Bio: "High-velocity kinetic drum & bass with neuro-funk basslines.", ImageURL: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80"},
	}

	for i := range artists {
		artists[i].JamendoID = fmt.Sprintf("artist-%d", i+1)
		database.DB.Create(&artists[i])
	}

	// 2. Albums
	albums := []models.Album{
		{Title: "Chromata", ArtistID: artists[0].ID, CoverURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80", ReleaseYear: 2024},
		{Title: "Tension in the Glass", ArtistID: artists[1].ID, CoverURL: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&q=80", ReleaseYear: 2023},
		{Title: "Stillness Studies", ArtistID: artists[2].ID, CoverURL: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80", ReleaseYear: 2024},
		{Title: "Subterfuge", ArtistID: artists[3].ID, CoverURL: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80", ReleaseYear: 2023},
		{Title: "Midnight Tea & Rewind", ArtistID: artists[4].ID, CoverURL: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80", ReleaseYear: 2024},
		{Title: "Kinetic Velocity", ArtistID: artists[5].ID, CoverURL: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80", ReleaseYear: 2024},
	}

	for i := range albums {
		albums[i].JamendoID = fmt.Sprintf("album-%d", i+1)
		database.DB.Create(&albums[i])
	}

	// Streamable sample MP3 URLs (Creative Commons audio samples)
	sampleAudio := "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
	sampleAudio2 := "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
	sampleAudio3 := "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"

	// 3. Songs across all 4 Sound Canvas quadrants
	songs := []models.Song{
		// Quadrant 1: Ambient / Uplifting (Low Energy, High Mood)
		{
			Title: "Solar Wind Nocturne", ArtistID: artists[2].ID, AlbumID: albums[2].ID,
			DurationSeconds: 245, AudioURL: sampleAudio, BPM: 72, MusicalKey: "D major",
			EnergyScore: 0.22, MoodScore: 0.85, TempoCategory: "slow", Genre: "ambient",
			Tags: "calm,reflective,light", ShareToken: randomToken(),
		},
		{
			Title: "Morning Mist on Glass", ArtistID: artists[2].ID, AlbumID: albums[2].ID,
			DurationSeconds: 198, AudioURL: sampleAudio2, BPM: 78, MusicalKey: "A major",
			EnergyScore: 0.28, MoodScore: 0.78, TempoCategory: "slow", Genre: "ambient",
			Tags: "morning,gentle,acoustic", ShareToken: randomToken(),
		},
		{
			Title: "Golden Hour Reverie", ArtistID: artists[4].ID, AlbumID: albums[4].ID,
			DurationSeconds: 182, AudioURL: sampleAudio3, BPM: 84, MusicalKey: "E major",
			EnergyScore: 0.36, MoodScore: 0.90, TempoCategory: "slow", Genre: "lofi",
			Tags: "sunset,warm,groove", ShareToken: randomToken(),
		},
		{
			Title: "Breathe in Daylight", ArtistID: artists[2].ID, AlbumID: albums[2].ID,
			DurationSeconds: 215, AudioURL: sampleAudio, BPM: 74, MusicalKey: "C major",
			EnergyScore: 0.24, MoodScore: 0.73, TempoCategory: "slow", Genre: "classical",
			Tags: "piano,peaceful,spacious", ShareToken: randomToken(),
		},

		// Quadrant 2: Euphoric / Kinetic (High Energy, High Mood)
		{
			Title: "Prism Velocity", ArtistID: artists[0].ID, AlbumID: albums[0].ID,
			DurationSeconds: 230, AudioURL: sampleAudio2, BPM: 132, MusicalKey: "F# minor",
			EnergyScore: 0.88, MoodScore: 0.82, TempoCategory: "fast", Genre: "synthwave",
			Tags: "driving,neon,uplifting", ShareToken: randomToken(),
		},
		{
			Title: "Neon Pulse 1999", ArtistID: artists[0].ID, AlbumID: albums[0].ID,
			DurationSeconds: 210, AudioURL: sampleAudio3, BPM: 128, MusicalKey: "G major",
			EnergyScore: 0.92, MoodScore: 0.79, TempoCategory: "fast", Genre: "electronic",
			Tags: "club,euphoria,dance", ShareToken: randomToken(),
		},
		{
			Title: "Subterranean Bloom", ArtistID: artists[5].ID, AlbumID: albums[5].ID,
			DurationSeconds: 260, AudioURL: sampleAudio, BPM: 142, MusicalKey: "B minor",
			EnergyScore: 0.85, MoodScore: 0.88, TempoCategory: "fast", Genre: "electronic",
			Tags: "festival,kinetic,rush", ShareToken: randomToken(),
		},
		{
			Title: "Electric Horizon", ArtistID: artists[0].ID, AlbumID: albums[0].ID,
			DurationSeconds: 240, AudioURL: sampleAudio2, BPM: 130, MusicalKey: "D major",
			EnergyScore: 0.95, MoodScore: 0.75, TempoCategory: "fast", Genre: "synthwave",
			Tags: "speed,highways,energy", ShareToken: randomToken(),
		},

		// Quadrant 3: Moody / Introspective (Low Energy, Low Mood)
		{
			Title: "Midnight Monolith", ArtistID: artists[3].ID, AlbumID: albums[3].ID,
			DurationSeconds: 280, AudioURL: sampleAudio3, BPM: 64, MusicalKey: "C minor",
			EnergyScore: 0.18, MoodScore: 0.24, TempoCategory: "slow", Genre: "darkwave",
			Tags: "night,shadows,solitude", ShareToken: randomToken(),
		},
		{
			Title: "Echoes in Empty Corridors", ArtistID: artists[1].ID, AlbumID: albums[1].ID,
			DurationSeconds: 310, AudioURL: sampleAudio, BPM: 68, MusicalKey: "Eb minor",
			EnergyScore: 0.25, MoodScore: 0.19, TempoCategory: "slow", Genre: "postrock",
			Tags: "melancholy,reverb,isolation", ShareToken: randomToken(),
		},
		{
			Title: "Winter Stasis", ArtistID: artists[2].ID, AlbumID: albums[2].ID,
			DurationSeconds: 265, AudioURL: sampleAudio2, BPM: 60, MusicalKey: "Bb minor",
			EnergyScore: 0.15, MoodScore: 0.31, TempoCategory: "slow", Genre: "ambient",
			Tags: "cold,minimal,stark", ShareToken: randomToken(),
		},
		{
			Title: "Ghost Signal Archive", ArtistID: artists[3].ID, AlbumID: albums[3].ID,
			DurationSeconds: 220, AudioURL: sampleAudio3, BPM: 70, MusicalKey: "F minor",
			EnergyScore: 0.30, MoodScore: 0.22, TempoCategory: "slow", Genre: "darkwave",
			Tags: "static,dystopian,low", ShareToken: randomToken(),
		},

		// Quadrant 4: Tense / Kinetic (High Energy, Low Mood)
		{
			Title: "Circuit Fracture", ArtistID: artists[3].ID, AlbumID: albums[3].ID,
			DurationSeconds: 195, AudioURL: sampleAudio, BPM: 144, MusicalKey: "Ab minor",
			EnergyScore: 0.94, MoodScore: 0.18, TempoCategory: "fast", Genre: "industrial",
			Tags: "aggression,distortion,heavy", ShareToken: randomToken(),
		},
		{
			Title: "Obsidian Core", ArtistID: artists[1].ID, AlbumID: albums[1].ID,
			DurationSeconds: 275, AudioURL: sampleAudio2, BPM: 136, MusicalKey: "D minor",
			EnergyScore: 0.89, MoodScore: 0.25, TempoCategory: "fast", Genre: "postrock",
			Tags: "tension,wall-of-sound,dark", ShareToken: randomToken(),
		},
		{
			Title: "Vortex Dissonance", ArtistID: artists[5].ID, AlbumID: albums[5].ID,
			DurationSeconds: 210, AudioURL: sampleAudio3, BPM: 150, MusicalKey: "C# minor",
			EnergyScore: 0.96, MoodScore: 0.12, TempoCategory: "fast", Genre: "industrial",
			Tags: "kinetic,fury,breakbeats", ShareToken: randomToken(),
		},
		{
			Title: "Static Overdrive", ArtistID: artists[1].ID, AlbumID: albums[1].ID,
			DurationSeconds: 245, AudioURL: sampleAudio, BPM: 138, MusicalKey: "E minor",
			EnergyScore: 0.82, MoodScore: 0.28, TempoCategory: "fast", Genre: "rock",
			Tags: "feedback,amps,raw", ShareToken: randomToken(),
		},

		// Mid-Tempo Balance & Nuance
		{
			Title: "Velvet Static", ArtistID: artists[4].ID, AlbumID: albums[4].ID,
			DurationSeconds: 190, AudioURL: sampleAudio2, BPM: 96, MusicalKey: "Ab major",
			EnergyScore: 0.52, MoodScore: 0.62, TempoCategory: "mid", Genre: "lofi",
			Tags: "tape,warmth,study", ShareToken: randomToken(),
		},
		{
			Title: "Crescent Shift", ArtistID: artists[0].ID, AlbumID: albums[0].ID,
			DurationSeconds: 225, AudioURL: sampleAudio3, BPM: 110, MusicalKey: "Bb major",
			EnergyScore: 0.60, MoodScore: 0.58, TempoCategory: "mid", Genre: "electronic",
			Tags: "analog,modular,flow", ShareToken: randomToken(),
		},
	}

	for i := range songs {
		songs[i].JamendoID = fmt.Sprintf("cc-track-%d", i+1)
		database.DB.Create(&songs[i])
	}

	log.Printf("DIVERGE Seeder: Successfully seeded %d artists, %d albums, and %d songs across all Sound Canvas coordinates!", len(artists), len(albums), len(songs))
}
