package moodtracking.repository;

import moodtracking.entity.DayNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DayNoteRepository extends JpaRepository<DayNote, Long> {
    Optional<DayNote> findByDate(String date);
    List<DayNote> findByDateBetween(String start, String end);
}
