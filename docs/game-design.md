# Game Design Document

## Overview

AI Adventure is a learning game inspired by Duolingo with RPG progression elements.

## Core Gameplay Loop

Learn
→ Practice
→ Complete Quiz
→ Earn XP
→ Level Up
→ Unlock New Content

## Player Progression

The player gains:

* Experience (XP)
* Levels
* Achievements
* Badges
* World Unlocks

## Content Structure

World
→ Stage
→ Node (lesson | challenge | puzzle | miniboss | boss)
→ Steps (text / quiz)
→ Reward (XP, Coins)

## Boss Battles

Bosses act as milestone challenges.

A boss can include:

* Multiple-choice questions
* Prompt engineering challenges
* Playwright exercises
* Practical automation scenarios

## Rewards

* XP
* Coins
* Achievements
* Cosmetic unlocks

## Visual Style

* Clean
* Modern
* Friendly
* Developer-focused

Inspired by:

* Duolingo
* Codecademy
* RPG progression systems

## Technical Philosophy

Data-driven systems whenever possible.

Lessons, quizzes, bosses, rewards, and progression should be configurable through data files instead of hardcoded logic.
