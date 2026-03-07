package moodtracking.repository;

import moodtracking.entity.WeekSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeekSummaryRepository extends JpaRepository<WeekSummary, Long> {
    Optional<WeekSummary> findByWeekStart(String weekStart);
}
