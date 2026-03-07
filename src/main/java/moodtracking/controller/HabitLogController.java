package moodtracking.controller;

import moodtracking.dto.HabitLogRequest;
import moodtracking.entity.HabitLog;
import moodtracking.repository.HabitLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habit-logs")
public class HabitLogController {

    private final HabitLogRepository repository;

    public HabitLogController(HabitLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<HabitLog> findByDate(@RequestParam String date) {
        return repository.findByDate(date);
    }

    @GetMapping("/week")
    public List<HabitLog> findByWeek(@RequestParam String start, @RequestParam String end) {
        return repository.findByDateBetween(start, end);
    }

    @PostMapping
    public ResponseEntity<HabitLog> upsert(@RequestBody HabitLogRequest req) {
        HabitLog log = repository.findByDateAndHabitId(req.date(), req.habitId())
                .orElse(new HabitLog());
        log.setDate(req.date());
        log.setHabitId(req.habitId());
        log.setStatus(req.status());
        return ResponseEntity.ok(repository.save(log));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String date, @RequestParam Long habitId) {
        repository.findByDateAndHabitId(date, habitId).ifPresent(repository::delete);
        return ResponseEntity.noContent().build();
    }
}
