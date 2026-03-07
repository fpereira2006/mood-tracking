package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "day_note")
public class DayNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String date;

    @Column(columnDefinition = "TEXT")
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
