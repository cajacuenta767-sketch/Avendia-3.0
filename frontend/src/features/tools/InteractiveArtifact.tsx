import { Check, ChevronLeft, ChevronRight, Eye, Lightbulb, RotateCcw } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";

export type WorkflowActivityItem = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  options?: string[];
  response_type?: "texto_breve" | "desarrollo" | "operacion" | "tabla" | "dibujo" | "producto_adjunto";
};

export type WorkflowActivity = {
  mode: string;
  title: string;
  instructions: string;
  items: WorkflowActivityItem[];
  word_bank?: string[];
  grid?: string[][];
};

type Props = { activity: WorkflowActivity; toolId: string; values?: Record<string, string | string[]> };

const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function normalizePuzzleWord(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-zÑñ]/g, "").toUpperCase();
}

function Flashcards({ activity }: { activity: WorkflowActivity }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  return <div className="interactive-grid interactive-grid--cards">{activity.items.map((item, index) => {
    const isRevealed = revealed.includes(item.id);
    return <button type="button" className={`study-card ${isRevealed ? "is-revealed" : ""}`} onClick={() => setRevealed((current) => isRevealed ? current.filter((id) => id !== item.id) : [...current, item.id])} key={item.id}>
      <span>Tarjeta {index + 1}</span><strong>{isRevealed ? item.answer : item.prompt}</strong><small>{isRevealed ? item.hint || "Toca para volver al frente" : "Toca para ver la respuesta"}</small>
    </button>;
  })}</div>;
}

function Presentation({ activity }: { activity: WorkflowActivity }) {
  const [index, setIndex] = useState(0);
  const slide = activity.items[index];
  if (!slide) return null;
  return <div className="slide-player"><div className="slide-player__toolbar"><span>Diapositiva {index + 1} de {activity.items.length}</span><div><button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0}><ChevronLeft /></button><button type="button" onClick={() => setIndex((current) => Math.min(activity.items.length - 1, current + 1))} disabled={index === activity.items.length - 1}><ChevronRight /></button></div></div><article><small>AVENDIA · PRESENTACIÓN DIDÁCTICA</small><h3>{slide.prompt}</h3><p>{slide.answer}</p>{(slide.options?.length ?? 0) > 0 && <ul>{slide.options?.map((option) => <li key={option}>{option}</li>)}</ul>}</article>{slide.hint && <aside><Lightbulb /><span><strong>Nota para el docente</strong>{slide.hint}</span></aside>}</div>;
}

function Hangman({ activity, lives }: { activity: WorkflowActivity; lives: number }) {
  const [index, setIndex] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const item = activity.items[index];
  if (!item) return null;
  const answer = normalizePuzzleWord(item.answer);
  const wrong = guesses.filter((letter) => !answer.includes(letter)).length;
  const won = answer.split("").every((letter) => guesses.includes(letter));
  const lost = wrong >= lives;
  const move = (delta: number) => { setIndex((current) => (current + delta + activity.items.length) % activity.items.length); setGuesses([]); };
  return <div className="hangman-board"><div className="hangman-board__status"><span>Palabra {index + 1} de {activity.items.length}</span><strong>{Math.max(0, lives - wrong)} intentos</strong></div><p className="hangman-board__clue">{item.prompt}</p><div className="hangman-board__word" aria-label="Palabra por descubrir">{answer.split("").map((letter, letterIndex) => <span key={`${letter}-${letterIndex}`}>{won || lost || guesses.includes(letter) ? letter : ""}</span>)}</div><div className="hangman-board__alphabet">{alphabet.map((letter) => <button type="button" disabled={guesses.includes(letter) || won || lost} className={guesses.includes(letter) ? answer.includes(letter) ? "is-correct" : "is-wrong" : ""} onClick={() => setGuesses((current) => [...current, letter])} key={letter}>{letter}</button>)}</div>{(won || lost) && <div className={`activity-feedback ${won ? "is-success" : "is-warning"}`}><strong>{won ? "¡Palabra completada!" : `La respuesta era ${answer}`}</strong><span>{item.hint}</span></div>}<footer className="interactive-footer"><button type="button" onClick={() => move(-1)}><ChevronLeft /> Anterior</button><button type="button" onClick={() => setGuesses([])}><RotateCcw /> Reiniciar</button><button type="button" onClick={() => move(1)}>Siguiente <ChevronRight /></button></footer></div>;
}

function Completion({ activity }: { activity: WorkflowActivity }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correctCount = activity.items.filter((item) => normalizePuzzleWord(answers[item.id] ?? "") === normalizePuzzleWord(item.answer)).length;
  return <div className="completion-list">{activity.items.map((item, index) => {
    const options = Array.from(new Set([...(item.options ?? []), item.answer])).sort();
    const isCorrect = normalizePuzzleWord(answers[item.id] ?? "") === normalizePuzzleWord(item.answer);
    return <article className={checked ? isCorrect ? "is-correct" : "is-wrong" : ""} key={item.id}><span>{index + 1}</span><div><p>{item.prompt}</p>{options.length > 1 ? <select value={answers[item.id] ?? ""} onChange={(event) => { setChecked(false); setAnswers((current) => ({ ...current, [item.id]: event.target.value })); }}><option value="">Selecciona la respuesta</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input value={answers[item.id] ?? ""} onChange={(event) => { setChecked(false); setAnswers((current) => ({ ...current, [item.id]: event.target.value })); }} placeholder="Escribe la palabra o expresión" />}{checked && <small>{isCorrect ? "Respuesta correcta" : `Respuesta: ${item.answer}`} · {item.hint}</small>}</div></article>;
  })}<div className="interactive-score"><button type="button" onClick={() => setChecked(true)}><Check /> Comprobar respuestas</button>{checked && <strong>{correctCount} de {activity.items.length} correctas</strong>}</div></div>;
}

function Matching({ activity }: { activity: WorkflowActivity }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const answers = useMemo(() => [...activity.items].reverse().map((item, index, all) => all[(index + 1) % all.length]), [activity.items]);
  const chooseAnswer = (item: WorkflowActivityItem) => {
    if (!selected || matched.includes(item.id)) return;
    setAttempts((current) => current + 1);
    if (selected === item.id) setMatched((current) => [...current, item.id]);
    setSelected(null);
  };
  return <div className="matching-board"><div><h4>Columna A</h4>{activity.items.map((item) => <button type="button" className={`${selected === item.id ? "is-selected" : ""} ${matched.includes(item.id) ? "is-matched" : ""}`} disabled={matched.includes(item.id)} onClick={() => setSelected(item.id)} key={item.id}>{item.prompt}</button>)}</div><div><h4>Columna B</h4>{answers.map((item) => <button type="button" className={matched.includes(item.id) ? "is-matched" : ""} disabled={matched.includes(item.id)} onClick={() => chooseAnswer(item)} key={item.id}>{item.answer}</button>)}</div><footer><strong>{matched.length} de {activity.items.length} pares</strong><span>{attempts} intentos</span><button type="button" onClick={() => { setMatched([]); setSelected(null); setAttempts(0); }}><RotateCcw /> Reiniciar</button></footer></div>;
}

type CrosswordEntry = { id: string; clue: string; answer: string; row: number; col: number; vertical: boolean; number: number };
type Crossword = { entries: CrosswordEntry[]; cells: Map<string, string>; rows: number; cols: number; offsetRow: number; offsetCol: number };

function buildCrossword(items: WorkflowActivityItem[]): Crossword {
  const source = items.map((item) => ({ ...item, clean: normalizePuzzleWord(item.answer) })).filter((item) => item.clean.length >= 2).sort((a, b) => b.clean.length - a.clean.length);
  const entries: CrosswordEntry[] = [];
  const cells = new Map<string, string>();
  const place = (item: typeof source[number], row: number, col: number, vertical: boolean) => {
    const entry = { id: item.id, clue: item.prompt, answer: item.clean, row, col, vertical, number: entries.length + 1 };
    entries.push(entry);
    item.clean.split("").forEach((letter, index) => cells.set(`${row + (vertical ? index : 0)},${col + (vertical ? 0 : index)}`, letter));
  };
  if (source[0]) place(source[0], 0, 0, false);
  for (const item of source.slice(1)) {
    let placed = false;
    for (const existing of entries) {
      for (let a = 0; a < item.clean.length && !placed; a += 1) for (let b = 0; b < existing.answer.length && !placed; b += 1) {
        if (item.clean[a] !== existing.answer[b]) continue;
        const vertical = !existing.vertical;
        const crossRow = existing.row + (existing.vertical ? b : 0);
        const crossCol = existing.col + (existing.vertical ? 0 : b);
        const row = crossRow - (vertical ? a : 0);
        const col = crossCol - (vertical ? 0 : a);
        const valid = item.clean.split("").every((letter, index) => {
          const key = `${row + (vertical ? index : 0)},${col + (vertical ? 0 : index)}`;
          return !cells.has(key) || cells.get(key) === letter;
        });
        if (valid) { place(item, row, col, vertical); placed = true; }
      }
    }
    if (!placed) place(item, entries.length * 2, 0, false);
  }
  const positions = [...cells.keys()].map((key) => key.split(",").map(Number));
  const minRow = Math.min(0, ...positions.map(([row]) => row));
  const minCol = Math.min(0, ...positions.map(([, col]) => col));
  const maxRow = Math.max(0, ...positions.map(([row]) => row));
  const maxCol = Math.max(0, ...positions.map(([, col]) => col));
  return { entries, cells, rows: maxRow - minRow + 1, cols: maxCol - minCol + 1, offsetRow: -minRow, offsetCol: -minCol };
}

function CrosswordBoard({ activity }: { activity: WorkflowActivity }) {
  const crossword = useMemo(() => buildCrossword(activity.items), [activity.items]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const startNumbers = new Map(crossword.entries.map((entry) => [`${entry.row},${entry.col}`, entry.number]));
  const solved = [...crossword.cells].every(([key, letter]) => letters[key]?.toUpperCase() === letter);
  return <div className="crossword-layout"><p className="puzzle-scroll-hint">Desliza la cuadrícula horizontalmente para ver todas las casillas.</p><div className="puzzle-scroll" tabIndex={0} aria-label="Cuadrícula de crucigrama desplazable"><div className="crossword-grid" style={{ gridTemplateColumns: `repeat(${crossword.cols}, 2.35rem)` }}>{Array.from({ length: crossword.rows * crossword.cols }, (_, index) => {
    const displayRow = Math.floor(index / crossword.cols); const displayCol = index % crossword.cols; const row = displayRow - crossword.offsetRow; const col = displayCol - crossword.offsetCol; const key = `${row},${col}`; const answer = crossword.cells.get(key);
    if (!answer) return <span className="crossword-grid__blank" key={key} />;
    return <label className={checked ? letters[key]?.toUpperCase() === answer ? "is-correct" : "is-wrong" : ""} key={key}>{startNumbers.has(key) && <small>{startNumbers.get(key)}</small>}<input aria-label={`Casilla ${displayRow + 1}-${displayCol + 1}`} maxLength={1} value={letters[key] ?? ""} onChange={(event) => { setChecked(false); setLetters((current) => ({ ...current, [key]: normalizePuzzleWord(event.target.value).slice(-1) })); }} /></label>;
  })}</div></div><ol className="crossword-clues">{crossword.entries.sort((a, b) => a.number - b.number).map((entry) => <li key={entry.id}><strong>{entry.number}. {entry.vertical ? "Vertical" : "Horizontal"}</strong><span>{entry.clue}</span></li>)}</ol><div className="interactive-score"><button type="button" onClick={() => setChecked(true)}><Check /> Comprobar crucigrama</button>{checked && <strong>{solved ? "¡Crucigrama resuelto!" : "Aún hay letras por revisar"}</strong>}</div></div>;
}

type WordSearch = {
  size: number;
  letters: string[][];
  placements: Record<string, string[]>;
  unplaced: string[];
};

function buildWordSearch(items: WorkflowActivityItem[]): WordSearch {
  const words = items.map((item) => ({ id: item.id, word: normalizePuzzleWord(item.answer) })).filter((item) => item.word.length > 1).sort((a, b) => b.word.length - a.word.length);
  const longestWord = Math.max(...words.map((item) => item.word.length), 10);
  const totalLetters = words.reduce((total, item) => total + item.word.length, 0);
  const size = Math.max(12, Math.min(32, Math.max(longestWord + 2, Math.ceil(Math.sqrt(totalLetters * 2.2)))));
  const letters = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => alphabet[(row * 7 + col * 11 + row * col) % 27]));
  const occupied = new Map<string, string>();
  const placements: Record<string, string[]> = {};
  const unplaced: string[] = [];
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];
  words.forEach((item) => {
    let bestPlacement: string[] | null = null;
    let bestIntersections = -1;
    for (let row = 0; row < size; row += 1) for (let col = 0; col < size; col += 1) for (const [dr, dc] of directions) {
      const endRow = row + dr * (item.word.length - 1);
      const endCol = col + dc * (item.word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
      const keys = item.word.split("").map((_, index) => `${row + dr * index},${col + dc * index}`);
      if (!keys.every((key, index) => !occupied.has(key) || occupied.get(key) === item.word[index])) continue;
      const intersections = keys.filter((key) => occupied.has(key)).length;
      if (intersections > bestIntersections) {
        bestPlacement = keys;
        bestIntersections = intersections;
      }
    }
    if (!bestPlacement) {
      unplaced.push(item.id);
      return;
    }
    placements[item.id] = bestPlacement;
    bestPlacement.forEach((key, index) => {
      const [row, col] = key.split(",").map(Number);
      occupied.set(key, item.word[index]);
      letters[row][col] = item.word[index];
    });
  });
  return { size, letters, placements, unplaced };
}

function WordSearchBoard({ activity }: { activity: WorkflowActivity }) {
  const puzzle = useMemo(() => buildWordSearch(activity.items), [activity.items]);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const found = activity.items.filter((item) => puzzle.placements[item.id]?.every((key) => selected.includes(key)));
  const cellSize = Math.max(1.05, Math.min(1.9, 30 / puzzle.size));
  const gridStyle = { gridTemplateColumns: `repeat(${puzzle.size}, var(--puzzle-cell))`, "--puzzle-cell": `${cellSize}rem` } as CSSProperties;
  return <div className="wordsearch-layout"><p className="puzzle-scroll-hint">Desliza la cuadrícula horizontalmente para ver todas las letras.</p><div className="puzzle-scroll" tabIndex={0} aria-label="Sopa de letras desplazable"><div className="wordsearch-grid" style={gridStyle}>{puzzle.letters.flatMap((row, rowIndex) => row.map((letter, colIndex) => { const key = `${rowIndex},${colIndex}`; const active = selected.includes(key); return <button type="button" aria-label={`Letra ${rowIndex + 1}-${colIndex + 1}`} className={active ? "is-selected" : ""} onClick={() => { setChecked(false); setSelected((current) => active ? current.filter((item) => item !== key) : [...current, key]); }} key={key}>{letter}</button>; }))}</div></div><div className="wordsearch-words"><h4>Palabras</h4>{activity.items.map((item) => <span className={found.some((foundItem) => foundItem.id === item.id) ? "is-found" : ""} key={item.id}>{item.answer}</span>)}</div>{puzzle.unplaced.length > 0 ? <p role="alert">No se pudieron ubicar todas las palabras. Regenera el recurso antes de entregarlo.</p> : null}<div className="interactive-score"><button type="button" onClick={() => setChecked(true)} disabled={puzzle.unplaced.length > 0}><Check /> Comprobar selección</button>{checked ? <strong>{found.length} de {activity.items.length} encontradas</strong> : null}</div></div>;
}

function ResourceCards({ activity }: { activity: WorkflowActivity }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  return <div className="interactive-grid">{activity.items.map((item, index) => <article className="resource-activity-card" key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.prompt}</h3><p>{item.answer}</p>{revealed.includes(item.id) ? <div><Lightbulb /><small>{item.hint}</small>{(item.options?.length ?? 0) > 0 && <ul>{item.options?.map((option) => <li key={option}>{option}</li>)}</ul>}</div> : <button type="button" onClick={() => setRevealed((current) => [...current, item.id])}><Eye /> Ver orientación</button>}</article>)}</div>;
}

export function InteractiveArtifact({ activity, toolId, values = {} }: Props) {
  const mode = activity.mode.toLowerCase();
  const lives = Math.max(4, Math.min(10, Number(values.lives) || 6));
  const content = toolId === "presentaciones-didacticas" || mode.includes("present") ? <Presentation activity={activity} />
    : toolId === "tarjetas-estudio" || mode.includes("tarjeta") ? <Flashcards activity={activity} />
    : toolId === "ahorcado" || mode.includes("ahorcado") ? <Hangman activity={activity} lives={lives} />
    : toolId === "completa-frase" || mode.includes("complet") ? <Completion activity={activity} />
    : toolId === "emparejar-palabras" || mode.includes("empare") ? <Matching activity={activity} />
    : toolId === "crucigramas" || mode.includes("crucigrama") ? <CrosswordBoard activity={activity} />
    : toolId === "sopas-letras" || mode.includes("sopa") ? <WordSearchBoard activity={activity} />
    : <ResourceCards activity={activity} />;
  return <section className="interactive-artifact"><header><span><Lightbulb /></span><div><small>RECURSO INTERACTIVO GENERADO CON IA</small><h2>{activity.title}</h2><p>{activity.instructions}</p></div></header>{content}</section>;
}
