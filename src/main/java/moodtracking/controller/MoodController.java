package moodtracking.controller;

import moodtracking.dto.DayNoteRequest;
import moodtracking.dto.MoodEntryRequest;
import moodtracking.dto.WeekSummaryRequest;
import moodtracking.entity.DayNote;
import moodtracking.entity.MoodEntry;
import moodtracking.entity.WeekSummary;
import moodtracking.repository.DayNoteRepository;
import moodtracking.repository.MoodEntryRepository;
import moodtracking.repository.WeekSummaryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/mood")
public class MoodController {

    private final MoodEntryRepository repository;
    private final WeekSummaryRepository summaryRepo;
    private final DayNoteRepository dayNoteRepo;

    public MoodController(MoodEntryRepository repository, WeekSummaryRepository summaryRepo, DayNoteRepository dayNoteRepo) {
        this.repository = repository;
        this.summaryRepo = summaryRepo;
        this.dayNoteRepo = dayNoteRepo;
    }

    @GetMapping
    public List<MoodEntry> getByDate(@RequestParam String date) {
        return repository.findByDate(date);
    }

    @PostMapping
    public ResponseEntity<MoodEntry> save(@RequestBody MoodEntryRequest request) {
        MoodEntry entry = repository.findByDateAndSlot(request.date(), request.slot())
                .orElse(new MoodEntry());

        entry.setDate(request.date());
        entry.setSlot(request.slot());
        entry.setEmojiCode(request.emojiCode());
        entry.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return ResponseEntity.ok(repository.save(entry));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String date, @RequestParam String slot) {
        repository.findByDateAndSlot(date, slot).ifPresent(repository::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/month")
    public List<MoodEntry> getByMonth(@RequestParam int year, @RequestParam int month) {
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDate last = first.withDayOfMonth(first.lengthOfMonth());
        return repository.findByDateBetween(first.toString(), last.toString());
    }

    @GetMapping("/week")
    public List<MoodEntry> getByWeek(@RequestParam String start, @RequestParam String end) {
        return repository.findByDateBetween(start, end);
    }

    @GetMapping("/week-summary")
    public ResponseEntity<WeekSummary> getWeekSummary(@RequestParam String weekStart) {
        return summaryRepo.findByWeekStart(weekStart)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/week-summary")
    public ResponseEntity<WeekSummary> saveWeekSummary(@RequestBody WeekSummaryRequest req) {
        WeekSummary ws = summaryRepo.findByWeekStart(req.weekStart()).orElse(new WeekSummary());
        ws.setWeekStart(req.weekStart());
        ws.setNote(req.note());
        return ResponseEntity.ok(summaryRepo.save(ws));
    }

    @GetMapping("/day-note")
    public ResponseEntity<DayNote> getDayNote(@RequestParam String date) {
        return dayNoteRepo.findByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/day-note")
    public ResponseEntity<DayNote> saveDayNote(@RequestBody DayNoteRequest req) {
        DayNote dn = dayNoteRepo.findByDate(req.date()).orElse(new DayNote());
        dn.setDate(req.date());
        dn.setNote(req.note());
        return ResponseEntity.ok(dayNoteRepo.save(dn));
    }

    @GetMapping("/day-notes")
    public List<DayNote> getDayNotes(@RequestParam String start, @RequestParam String end) {
        return dayNoteRepo.findByDateBetween(start, end);
    }
}
