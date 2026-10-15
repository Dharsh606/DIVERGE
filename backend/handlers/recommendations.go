package handlers

import (
	"github.com/diverge/backend/middleware"
	"github.com/diverge/backend/services"
	"github.com/gofiber/fiber/v2"
)

// GET /api/recommendations
func GetRecommendations(c *fiber.Ctx) error {
	var userID uint
	if id, ok := middleware.GetUserID(c); ok {
		userID = id
	}
	result := services.GetRecommendations(userID, 20)
	return c.JSON(result)
}

// GET /api/recommendations/anti
func GetAntiRecommendations(c *fiber.Ctx) error {
	var userID uint
	if id, ok := middleware.GetUserID(c); ok {
		userID = id
	}
	result := services.GetAntiAlgorithmRecommendations(userID, 20)
	return c.JSON(result)
}

// GET /api/recommendations/canvas
func GetCanvasData(c *fiber.Ctx) error {
	data := services.GetSoundCanvasData()
	return c.JSON(data)
}
