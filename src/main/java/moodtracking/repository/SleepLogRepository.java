package moodtracking.repository;

import moodtracking.entity.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    Optional<SleepLog> findByDate(String date);
    List<SleepLog> findByDateBetween(String startDate, String endDate);
}
