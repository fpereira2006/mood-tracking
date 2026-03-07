package moodtracking.repository;

import moodtracking.entity.MoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MoodEntryRepository extends JpaRepository<MoodEntry, Long> {

    List<MoodEntry> findByDate(String date);

    List<MoodEntry> findByDateBetween(String start, String end);

    Optional<MoodEntry> findByDateAndSlot(String date, String slot);
}
