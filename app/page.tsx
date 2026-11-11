"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bow, Heart } from "@/components/Decor";
import { useDecks } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { decks, loaded, addDeck } = useDecks();
  const [name, setName] = useState("");

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = addDeck(name);
    setName("");
    router.push(`/deck/${id}`);
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <Bow size={40} />
          <div>
            Evelyn Cards <Heart size={18} />
            <small>made with love</small>
          </div>
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>Let&apos;s review, cutie!</h1>
          <p>Make a deck, add cards, and flip through them anytime. Everything saves on this device.</p>
        </div>
      </section>

      <form className="panel stack" onSubmit={create}>
        <label className="field">
          New deck
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pharmacology - Chapter 3"
            maxLength={80}
          />
        </label>
        <button className="btn" type="submit" disabled={!name.trim()}>
          Create deck
        </button>
      </form>

      <h2 className="section-title">My decks</h2>

      {!loaded ? null : decks.length === 0 ? (
        <div className="panel empty">
          <Bow size={56} />
          <p>No decks yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="stack">
          {decks.map((d) => {
            const known = d.cards.filter((c) => c.known).length;
            const pct = d.cards.length ? Math.round((known / d.cards.length) * 100) : 0;
            return (
              <Link key={d.id} href={`/deck/${d.id}`} className="deck-card">
                <div className="deck-icon">
                  <Heart size={26} color="#ff7fb0" />
                </div>
                <div className="grow">
                  <h3>{d.name}</h3>
                  <div className="meta">
                    {d.cards.length} {d.cards.length === 1 ? "card" : "cards"}
                    {d.cards.length > 0 ? ` · ${pct}% got it` : ""}
                  </div>
                  {d.cards.length > 0 && (
                    <div className="bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
