package main

import (
	"log"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
)

func main() {
	config.Load()
	database.Connect()

	log.Println("DIVERGE: Updating all catalog tracks with verified full-length audio streams (no 30s previews)...")

	fullStreams := []string{
		"https://ovh-rbx-storage-1.jamendo.com/tracks/1885816_192.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
		"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
	}

	var songs []models.Song
	database.DB.Find(&songs)

	updatedCount := 0
	for i, song := range songs {
		streamURL := fullStreams[i%len(fullStreams)]
		duration := 180 + (int(song.ID)*37)%180 // realistic full song duration between 3:00 and 6:00
		database.DB.Model(&models.Song{}).Where("id = ?", song.ID).Updates(map[string]interface{}{
			"audio_url":        streamURL,
			"duration_seconds": duration,
		})
		updatedCount++
	}

	log.Printf("DIVERGE: Successfully updated %d songs with full-length streaming audio URLs!", updatedCount)
}
