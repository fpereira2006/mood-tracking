package moodtracking.dto;

public record HabitRequest(Long id, String name, Integer priority, String icon, Boolean active) {}
