package moodtracking.controller;

import moodtracking.dto.SleepLogRequest;
import moodtracking.entity.SleepLog;
import moodtracking.repository.SleepLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sleep-log")
public class SleepLogController {

    private final SleepLogRepository repository;

    public SleepLogController(SleepLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<SleepLog> getByDate(@RequestParam String date) {
        return repository.findByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String date) {
        repository.findByDate(date).ifPresent(repository::delete);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SleepLog> save(@RequestBody SleepLogRequest req) {
        SleepLog log = repository.findByDate(req.date()).orElse(new SleepLog());
        log.setDate(req.date());
        log.setBedtime(req.bedtime());
        log.setWakeTime(req.wakeTime());
        log.setQuality(req.quality());
        return ResponseEntity.ok(repository.save(log));
    }
}
