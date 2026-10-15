package models

import (
	"time"

	"gorm.io/gorm"
)

// ─── User ────────────────────────────────────────────────────────────────────

type User struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Username     string         `gorm:"uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"not null" json:"-"`
	AvatarURL    string         `json:"avatar_url"`
}

// ─── Artist ──────────────────────────────────────────────────────────────────

type Artist struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `gorm:"not null;index" json:"name"`
	Bio       string    `json:"bio"`
	ImageURL  string    `json:"image_url"`
	JamendoID string    `gorm:"uniqueIndex" json:"jamendo_id,omitempty"`
	Albums    []Album   `json:"albums,omitempty"`
}

// ─── Album ───────────────────────────────────────────────────────────────────

type Album struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	Title       string    `gorm:"not null;index" json:"title"`
	ArtistID    uint      `gorm:"not null;index" json:"artist_id"`
	Artist      *Artist   `json:"artist,omitempty"`
	CoverURL    string    `json:"cover_url"`
	ReleaseYear int       `json:"release_year"`
	JamendoID   string    `gorm:"uniqueIndex" json:"jamendo_id,omitempty"`
	Songs       []Song    `json:"songs,omitempty"`
}

// ─── Song ─────────────────────────────────────────────────────────────────────

type Song struct {
	ID              uint      `gorm:"primarykey" json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	Title           string    `gorm:"not null;index" json:"title"`
	AlbumID         uint      `json:"album_id"`
	Album           *Album    `json:"album,omitempty"`
	ArtistID        uint      `gorm:"not null;index" json:"artist_id"`
	Artist          *Artist   `json:"artist,omitempty"`
	DurationSeconds int       `json:"duration_seconds"`
	// Audio delivery
	AudioURL  string `json:"audio_url"`  // Jamendo stream URL
	FilePath  string `json:"file_path"`  // local file if downloaded offline
	FileSize  int64  `json:"file_size"`
	JamendoID string `gorm:"uniqueIndex" json:"jamendo_id,omitempty"`
	// Sound Canvas + Track DNA metadata
	BPM           float64 `json:"bpm"`
	MusicalKey    string  `json:"musical_key"`
	EnergyScore   float64 `json:"energy_score"`   // 0.0–1.0
	MoodScore     float64 `json:"mood_score"`     // 0.0–1.0 (valence: sad→happy)
	TempoCategory string  `json:"tempo_category"` // slow / mid / fast
	Genre         string  `gorm:"index" json:"genre"`
	Tags          string  `json:"tags"` // comma-separated Jamendo tags
	// Sharing
	ShareToken string `gorm:"uniqueIndex" json:"share_token"`
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

type Playlist struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	UserID      uint           `gorm:"not null;index" json:"user_id"`
	User        *User          `json:"user,omitempty"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	CoverURL    string         `json:"cover_url"`
	IsPublic    bool           `gorm:"default:false" json:"is_public"`
	ShareToken  string         `gorm:"uniqueIndex" json:"share_token"`
	Songs       []Song         `gorm:"many2many:playlist_songs;" json:"songs,omitempty"`
}

// ─── PlaylistSong (join table with ordering) ──────────────────────────────────

type PlaylistSong struct {
	PlaylistID uint      `gorm:"primaryKey" json:"playlist_id"`
	SongID     uint      `gorm:"primaryKey" json:"song_id"`
	Position   int       `json:"position"`
	AddedAt    time.Time `json:"added_at"`
}

// ─── ListeningHistory ─────────────────────────────────────────────────────────

type ListeningHistory struct {
	ID                  uint      `gorm:"primarykey" json:"id"`
	UserID              uint      `gorm:"not null;index" json:"user_id"`
	SongID              uint      `gorm:"not null;index" json:"song_id"`
	Song                *Song     `json:"song,omitempty"`
	PlayedAt            time.Time `gorm:"not null;index" json:"played_at"`
	PlayDurationSeconds int       `json:"play_duration_seconds"`
	Completed           bool      `json:"completed"`
	ContextTags         string    `json:"context_tags"` // comma-separated e.g. "Morning,Focus"
}

// ─── ContextTag ───────────────────────────────────────────────────────────────

type ContextTag struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	SongID    uint      `gorm:"not null;index" json:"song_id"`
	Song      *Song     `json:"song,omitempty"`
	TagName   string    `gorm:"not null;index" json:"tag_name"`
}

// ─── DivergeSession ───────────────────────────────────────────────────────────

type DivergeSession struct {
	ID                     uint      `gorm:"primarykey" json:"id"`
	CreatedAt              time.Time `json:"created_at"`
	HostUserID             uint      `gorm:"not null" json:"host_user_id"`
	Host                   *User     `gorm:"foreignKey:HostUserID" json:"host,omitempty"`
	Name                   string    `json:"name"`
	ShareCode              string    `gorm:"uniqueIndex;not null" json:"share_code"`
	CurrentSongID          *uint     `json:"current_song_id"`
	CurrentSong            *Song     `gorm:"foreignKey:CurrentSongID" json:"current_song,omitempty"`
	CurrentPositionSeconds float64   `json:"current_position_seconds"`
	IsPlaying              bool      `json:"is_playing"`
}

// ─── SessionParticipant ───────────────────────────────────────────────────────

type SessionParticipant struct {
	SessionID    uint      `gorm:"primaryKey" json:"session_id"`
	UserID       uint      `gorm:"primaryKey" json:"user_id"`
	User         *User     `json:"user,omitempty"`
	JoinedAt     time.Time `json:"joined_at"`
	CanEditQueue bool      `gorm:"default:true" json:"can_edit_queue"`
}
