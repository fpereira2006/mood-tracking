package moodtracking.controller;

import moodtracking.dto.HabitRequest;
import moodtracking.entity.Habit;
import moodtracking.repository.HabitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    private final HabitRepository repository;

    public HabitController(HabitRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Habit> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(h -> h.getCreatedAt() == null ? "" : h.getCreatedAt()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<Habit> save(@RequestBody HabitRequest request) {
        Habit habit = (request.id() != null)
                ? repository.findById(request.id()).orElse(new Habit())
                : new Habit();

        habit.setName(request.name());
        if (habit.getCreatedAt() == null) {
            habit.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return ResponseEntity.ok(repository.save(habit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
