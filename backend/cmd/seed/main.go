package main

import (
	"log"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/database"
	"github.com/diverge/backend/models"
	"github.com/diverge/backend/services"
)

func main() {
	config.Load()
	database.Connect()

	log.Println("DIVERGE Seeder: Seeding curated Indian & World tracks into PostgreSQL...")

	queries := []struct {
		Term  string
		Limit int
	}{
		{"Arijit Singh", 5},        // Bollywood / Hindi
		{"Anirudh Ravichander", 5}, // Tamil / Kollywood
		{"Diljit Dosanjh", 4},      // Punjabi Pop
		{"Sid Sriram", 4},          // Telugu / Carnatic
		{"A.R. Rahman", 4},         // Indian Cinematic Masterpieces
		{"Prateek Kuhad", 3},       // Indian Indie
		{"The Weeknd", 4},          // World Pop / Synthwave
		{"Coldplay", 4},            // World Alternative Rock
		{"Ludovico Einaudi", 3},    // World Classical / Ambient
	}

	totalSeeded := 0
	for _, q := range queries {
		log.Printf("Seeding query: %s (limit %d)...", q.Term, q.Limit)
		songs, err := services.SearchCatalog(q.Term, q.Limit)
		if err != nil {
			log.Printf("Warning: failed to seed query %s: %v", q.Term, err)
			continue
		}
		totalSeeded += len(songs)
		log.Printf("Seeded %d songs for %s", len(songs), q.Term)
	}

	var count int64
	database.DB.Model(&models.Song{}).Count(&count)
	log.Printf("DIVERGE Seeder: Total songs in database now: %d", count)
}
