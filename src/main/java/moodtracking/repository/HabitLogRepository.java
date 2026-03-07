package moodtracking.repository;

import moodtracking.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByDate(String date);
    Optional<HabitLog> findByDateAndHabitId(String date, Long habitId);
    List<HabitLog> findByDateBetween(String startDate, String endDate);
}
