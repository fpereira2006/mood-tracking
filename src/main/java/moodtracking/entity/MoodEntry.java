package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mood_entry", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"date", "slot"})
})
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String slot;

    @Column(name = "emoji_code", nullable = false)
    private String emojiCode;

    @Column(name = "created_at")
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getEmojiCode() { return emojiCode; }
    public void setEmojiCode(String emojiCode) { this.emojiCode = emojiCode; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
