package main

import (
	"log"

	"github.com/diverge/backend/config"
	"github.com/diverge/backend/database"
	"github.com/diverge/backend/handlers"
	"github.com/diverge/backend/middleware"
	"github.com/diverge/backend/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load environment config
	config.Load()

	// Connect to PostgreSQL and auto-migrate schema
	database.Connect()

	// Seed music from Jamendo on startup (skips if already seeded)
	go func() {
		if err := services.SeedFromJamendo(200); err != nil {
			log.Printf("Seed warning: %v", err)
		}
	}()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "DIVERGE API v1",
		ErrorHandler: errorHandler,
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[DIVERGE] ${time} ${method} ${path} → ${status} (${latency})\n",
	}))
	app.Use(middleware.CORS())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "DIVERGE API"})
	})

	// ─── API Routes ────────────────────────────────────────────────────────────
	api := app.Group("/api")

	// Auth
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)
	auth.Post("/logout", handlers.Logout)
	auth.Get("/me", middleware.Protected(), handlers.Me)

	// Songs
	songs := api.Group("/songs")
	songs.Get("/", middleware.OptionalAuth(), handlers.GetSongs)
	songs.Get("/trending", handlers.GetTrending)
	songs.Get("/live-search", handlers.SearchLiveSongs)
	songs.Get("/:id", middleware.OptionalAuth(), handlers.GetSong)
	songs.Get("/:id/stream", middleware.OptionalAuth(), handlers.StreamSong)
	songs.Get("/:id/dna", handlers.GetSongDNA)

	// Genres
	api.Get("/genres", handlers.GetGenres)

	// Playlists
	playlists := api.Group("/playlists", middleware.Protected())
	playlists.Get("/", handlers.GetPlaylists)
	playlists.Post("/", handlers.CreatePlaylist)
	playlists.Get("/:id", handlers.GetPlaylist)
	playlists.Put("/:id", handlers.UpdatePlaylist)
	playlists.Delete("/:id", handlers.DeletePlaylist)
	playlists.Post("/:id/songs", handlers.AddSongToPlaylist)
	playlists.Delete("/:id/songs/:songId", handlers.RemoveSongFromPlaylist)

	// Public share routes (no auth)
	api.Get("/share/playlist/:token", handlers.GetPlaylistByShareToken)

	// Recommendations
	rec := api.Group("/recommendations")
	rec.Get("/canvas", handlers.GetCanvasData)
	rec.Get("/", middleware.OptionalAuth(), handlers.GetRecommendations)
	rec.Get("/anti", middleware.OptionalAuth(), handlers.GetAntiRecommendations)
	rec.Get("/context", middleware.Protected(), handlers.GetContextRecommendations)

	// History + Trace
	api.Post("/history", middleware.Protected(), handlers.LogHistory)
	api.Get("/history/trace", middleware.Protected(), handlers.GetTrace)

	// Context Tags
	tags := api.Group("/tags", middleware.Protected())
	tags.Get("/", handlers.GetContextTags)
	tags.Post("/", handlers.AddContextTag)
	tags.Delete("/:id", handlers.DeleteContextTag)

	// Start server
	log.Printf("DIVERGE API starting on port %s", config.App.Port)
	if err := app.Listen(":" + config.App.Port); err != nil {
		log.Fatalf("DIVERGE: Server failed: %v", err)
	}
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{"error": err.Error()})
}
