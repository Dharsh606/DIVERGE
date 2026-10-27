================================================================================

DIVERGE - HIGH-PERFORMANCE DIGITAL AUDIO PLATFORM & MUSICOLOGY DISCOVERY SYSTEM

Tech Vedhu Internship Capstone Project Submission

================================================================================

AUTHOR / CANDIDATE DETAILS:

--------------------------------------------------------------------------------

Author / Intern : Dharshan V

Role : Software Developer (Full-Stack Web Development Course)

Evaluation Program : Tech Vedhu Internship Capstone Submission

Submission Track : Full-Stack Web Development (Go, Svelte Kit, PostgreSQL, Audio)

Contact Phone : +91 6382546285

Contact Email : dharshan.vreddy2819@gmail.com

Personal Portfolio : https://dharshanvportfolio.netlify.app/

LinkedIn Profile : https://www.linkedin.com/in/dharshanvreddy

GitHub Profile : https://github.com/Dharsh606

OFFICIAL DEPLOYMENT & REPOSITORY LINKS:

--------------------------------------------------------------------------------

Source Code & Files - Google Drive Link : https://drive.google.com/drive/folders/1sH8__JBExhQXRdiQBAk-ezA1-2RXRVys?usp=sharing

Live Web Application: https://diverge-music.vercel.app

GitHub Repository : https://github.com/Dharsh606/DIVERGE

API Status : Operational (HTTP 200 OK)

Deployment Platform : Vercel Global Edge Network

================================================================================

1. WELCOME & SUBMISSION OVERVIEW

================================================================================

Welcome to the official source code package and documentation for DIVERGE,

submitted as the final capstone project for the Tech Vedhu Internship Program

by Dharshan V.

DIVERGE is an digital music streaming and acoustic discovery

platform engineered from the ground up to overcome the limitations of modern

algorithmic streaming services. It combines high-throughput backend services,

sub-second multi-catalog search, full-length master track streaming, and a

bespoke luxury user interface inspired directly by the 3D DIVERGE brand emblem.

The platform is fully deployed and accessible live in the browser without

requiring any local compilation or database setup:

>>> Launch Live Application: https://diverge-music.vercel.app <<<
Source Code & Files - Google Drive Link : https://drive.google.com/drive/folders/1sH8__JBExhQXRdiQBAk-ezA1-2RXRVys?usp=sharing

================================================================================

2. SUBMISSION DELIVERABLES & DIRECTORY STRUCTURE

================================================================================

This ZIP package contains the complete source code, documentation assets,

and evaluation deliverables organized as follows:

DIVERGE/

│

├── README.txt <-- You are reading this file (Submission Guide)

├── README.md <-- High-contrast GitHub presentation & badges

│

├── docs/ <-- EVALUATION DELIVERABLES & DOCUMENTATION

│ ├── project-report.pdf <-- Comprehensive 12-page Technical Project Report

│ │ (Architecture, Schema, Testing Matrix, Q&A)

│ ├── presentation.pptx <-- 12-Slide Widescreen (16:9) Pitch Deck

│ │ (Executive summary, design system, diagrams)

│ ├── ARCHITECTURE_AND_SETUP.md <-- Complete Engineering & Local Setup Specification

│ ├── logo.png <-- Official 3D Brand Logo Wordmark

│ └── logo-mark.png <-- High-DPI 3D Emblem Symbol

│

├── backend/ <-- HIGH-PERFORMANCE GO BACKEND

│ ├── cmd/

│ │ ├── seed/ <-- Catalog database seeder

│ │ ├── update_full_songs/ <-- Full-length track metadata updater

│ │ └── restore_real_songs/ <-- Acoustic attribute normalizer

│ ├── config/ <-- Environment & configuration loader

│ ├── database/ <-- PostgreSQL connection pool & GORM migrations

│ ├── handlers/ <-- FastHTTP REST API route controllers

│ ├── middleware/ <-- JWT cookie validation & CORS handlers

│ ├── models/ <-- 9 normalized relational database entities

│ ├── services/ <-- Audio streaming, catalog & recommendation logic

│ ├── go.mod & go.sum <-- Go 1.22 dependency definitions

│ └── main.go <-- Fiber server entrypoint & router initialization

│

└── frontend/ <-- REACTIVE SVELTEKIT / SVELTE 5 CLIENT

├── src/

│ ├── lib/

│ │ ├── components/ <-- UI components (AudioPlayer, Search, Waves, Auth)

│ │ ├── server/ <-- Server-side YouTube Music InnerTube proxy

│ │ ├── services/ <-- Client REST API client & IndexedDB engine

│ │ ├── stores/ <-- Reactive stores (player, auth, search, liked)

│ │ └── types/ <-- TypeScript interfaces & data contracts

│ └── routes/ <-- SvelteKit file-based routing (+layout, +page)

│ ├── api/ <-- Serverless endpoints (songs, search, genres, auth)

│ ├── search/ <-- Instant multi-genre search catalog view

│ ├── library/ <-- Personal collection, playlists & Liked Songs

│ ├── trace/ <-- Procedural acoustic journey graph

│ └── profile/ <-- Account management & playback statistics

├── static/ <-- Web App Manifest, Service Worker (PWA) & Icons

├── package.json <-- Frontend dependencies & scripts

└── vite.config.ts <-- Vite bundler configuration

================================================================================

3. TECHNOLOGY STACK SUMMARY

================================================================================

Layer Technology Purpose

------------------- -------------------------- -----------------------------

Backend Router Go 1.22 + Fiber v2 Zero-allocation HTTP gateway

Frontend Framework SvelteKit 2 + Svelte 5 Pure reactivity without vDOM

Database PostgreSQL 16 (UTF-8, C) ACID relational data storage

ORM & Schema GORM (Go) Entity auto-migrations

Audio Protocol HTTP 206 Partial Content Byte-range chunked streaming

Client Storage IndexedDB + Service Worker Binary audio blob offline PWA

UI Motion Engine React Bits + CSS3 Hardware Canvas waves, spotlight card

Authentication Signed JWT + Bcrypt (Cost 10) HTTP-only secure cookie sessions

================================================================================

4. HOW TO REVIEW THIS SUBMISSION

================================================================================

1. IMMEDIATE LIVE EVALUATION:

Open https://diverge-music.vercel.app in any modern browser (Google Chrome or

Microsoft Edge recommended for PWA and Picture-in-Picture capabilities).

2. PRESENTATION DECK & PROJECT REPORT:

Review the deliverables located in the "docs/" folder:

- docs/presentation.pptx : 12-slide executive presentation

- docs/project-report.pdf : 12-page technical report with test cases

3. LOCAL ENVIRONMENT SETUP (OPTIONAL):

If you wish to compile and run the Go backend and PostgreSQL database locally,

detailed step-by-step instructions are provided in:

- docs/ARCHITECTURE_AND_SETUP.md

================================================================================

DIVERGE -- Capstone Engineering Project Submission for Tech Vedhu

Designed & Engineered by Dharshan V (Software Developer)


Source Code & Files - Google Drive Link : https://drive.google.com/drive/folders/1sH8__JBExhQXRdiQBAk-ezA1-2RXRVys?usp=sharing

Live Platform: https://diverge-music.vercel.app

Portfolio : https://dharshanvportfolio.netlify.app/

LinkedIn : https://www.linkedin.com/in/dharshanvreddy

================================================================================

