package database

import (
	"log"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	var err error
	DB, err = gorm.Open(postgres.Open(config.App.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("DIVERGE: Failed to connect to database: %v", err)
	}
	log.Println("DIVERGE: Database connected")
	autoMigrate()
}

func autoMigrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Artist{},
		&models.Album{},
		&models.Song{},
		&models.Playlist{},
		&models.PlaylistSong{},
		&models.ListeningHistory{},
		&models.ContextTag{},
		&models.DivergeSession{},
		&models.SessionParticipant{},
	)
	if err != nil {
		log.Fatalf("DIVERGE: AutoMigrate failed: %v", err)
	}
	log.Println("DIVERGE: Schema migrated")
}
