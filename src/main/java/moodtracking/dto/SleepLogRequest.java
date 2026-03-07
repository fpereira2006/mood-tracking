package moodtracking.dto;

public record SleepLogRequest(String date, String bedtime, String wakeTime, String quality) {}
