"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bow, Heart } from "@/components/Decor";
import { useDecks, type Card } from "@/lib/store";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudyPage() {
  const params = useParams<{ id: string }>();
  const { decks, loaded, setKnown } = useDecks();
  const deck = decks.find((d) => d.id === params.id);

  /** Queue of card ids for this round; null until she starts a round. */
  const [queue, setQueue] = useState<string[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [missedCount, setMissedCount] = useState(0);

  const byId = useMemo(() => {
    const m = new Map<string, Card>();
    deck?.cards.forEach((c) => m.set(c.id, c));
    return m;
  }, [deck]);

  if (!loaded) return null;

  if (!deck || deck.cards.length === 0) {
    return (
      <>
        <header className="topbar">
          <Link href="/" className="back" aria-label="Back to decks">
            ←
          </Link>
        </header>
        <div className="panel empty">
          <Bow size={56} />
          <p>There&apos;s nothing to study here yet. Add some cards first!</p>
        </div>
      </>
    );
  }

  const deckId = deck.id;
  const total = deck.cards.length;
  const unknownIds = deck.cards.filter((c) => !c.known).map((c) => c.id);

  function startRound(ids: string[]) {
    setQueue(shuffle(ids));
    setFlipped(false);
    setMissedCount(0);
  }

  function answer(gotIt: boolean) {
    if (!queue) return;
    const [currentId, ...rest] = queue;
    setKnown(deckId, currentId, gotIt);
    if (!gotIt) setMissedCount((n) => n + 1);
    setFlipped(false);
    // short delay lets the card flip back before the next text appears
    setTimeout(() => setQueue(rest), 150);
  }

  // Start screen
  if (queue === null) {
    return (
      <>
        <header className="topbar">
          <Link href={`/deck/${deckId}`} className="back" aria-label="Back to deck">
            ←
          </Link>
          <h1 style={{ fontSize: "1.3rem", color: "var(--pink-600)", overflowWrap: "anywhere" }}>
            {deck.name}
          </h1>
        </header>
        <div className="panel celebrate">
          <Bow size={64} />
          <h2>Ready to study?</h2>
          <p className="meta">
            {total} {total === 1 ? "card" : "cards"} · {total - unknownIds.length} marked &quot;got it&quot;
          </p>
          <div className="stack" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => startRound(deck.cards.map((c) => c.id))}>
              Study all cards
            </button>
            <button
              className="btn soft"
              disabled={unknownIds.length === 0}
              onClick={() => startRound(unknownIds)}
            >
              Only the ones I&apos;m still learning ({unknownIds.length})
            </button>
          </div>
        </div>
      </>
    );
  }

  // Round finished
  if (queue.length === 0) {
    const stillLearning = deck.cards.filter((c) => !c.known).map((c) => c.id);
    return (
      <>
        <header className="topbar">
          <Link href={`/deck/${deckId}`} className="back" aria-label="Back to deck">
            ←
          </Link>
        </header>
        <div className="panel celebrate">
          <Heart size={48} />
          <h2>{missedCount === 0 ? "You got them all!" : "Nice round!"}</h2>
          <p className="meta">
            {stillLearning.length === 0
              ? "Every card in this deck is marked as got it."
              : `${stillLearning.length} ${stillLearning.length === 1 ? "card is" : "cards are"} still in learning.`}
          </p>
          <div className="stack" style={{ marginTop: 16 }}>
            {stillLearning.length > 0 && (
              <button className="btn" onClick={() => startRound(stillLearning)}>
                Practice the ones I missed
              </button>
            )}
            <button className="btn soft" onClick={() => startRound(deck.cards.map((c) => c.id))}>
              Study all again
            </button>
            <Link href={`/deck/${deckId}`} className="btn ghost" style={{ textAlign: "center" }}>
              Back to deck
            </Link>
          </div>
        </div>
      </>
    );
  }

  const current = byId.get(queue[0]);
  if (!current) {
    // card was deleted in another tab; drop it from the round
    return (
      <div className="panel celebrate">
        <p className="meta">This card is no longer in the deck.</p>
        <button className="btn" onClick={() => setQueue(queue.slice(1))}>
          Next card
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <Link href={`/deck/${deckId}`} className="back" aria-label="Back to deck">
          ←
        </Link>
        <div className="grow">
          <div className="bar" style={{ marginTop: 0 }}>
            <span style={{ width: `${Math.round(((total - queue.length) / total) * 100)}%` }} />
          </div>
        </div>
      </header>

      <div className="study-count">{queue.length} left</div>

      <button
        className={flipped ? "flip flipped" : "flip"}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div className="flip-inner">
          <div className="face front">
            <span className="tag">Question</span>
            {current.front}
          </div>
          <div className="face back">
            <span className="tag">Answer</span>
            {current.back}
          </div>
        </div>
      </button>

      {!flipped ? (
        <div className="tap-hint">Tap the card to flip it</div>
      ) : (
        <div className="answer-row">
          <button className="btn again" onClick={() => answer(false)}>
            Still learning
          </button>
          <button className="btn" onClick={() => answer(true)}>
            Got it!
          </button>
        </div>
      )}
    </>
  );
}
