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
                .sorted(Comparator
                        .comparingInt((Habit h) -> h.getPriority() == null ? Integer.MIN_VALUE : h.getPriority())
                        .reversed()
                        .thenComparingInt(h -> h.getPosition() == null ? Integer.MAX_VALUE : h.getPosition()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<Habit> save(@RequestBody HabitRequest request) {
        Habit habit = (request.id() != null)
                ? repository.findById(request.id()).orElse(new Habit())
                : new Habit();

        habit.setName(request.name());
        if (request.priority() != null) {
            habit.setPriority(request.priority());
        } else if (habit.getPriority() == null) {
            habit.setPriority(5);
        }
        if (habit.getCreatedAt() == null) {
            habit.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (request.icon() != null) {
            habit.setIcon(request.icon());
        }
        if (habit.getPosition() == null) {
            int max = repository.findAll().stream()
                    .mapToInt(h -> h.getPosition() == null ? 0 : h.getPosition())
                    .max().orElse(0);
            habit.setPosition(max + 1);
        }

        return ResponseEntity.ok(repository.save(habit));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            final int position = i;
            repository.findById(ids.get(i)).ifPresent(h -> {
                h.setPosition(position);
                repository.save(h);
            });
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
