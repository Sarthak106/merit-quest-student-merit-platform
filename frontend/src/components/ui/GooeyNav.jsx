import { useRef, useEffect, useState, useCallback } from "react";
import "./GooeyNav.css";

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [active, setActive] = useState(initialActiveIndex);

  const COLOR_MAP = {
    1: "#6366f1", // indigo-500
    2: "#a855f7", // purple-500
    3: "#818cf8", // indigo-400
    4: "#f59e0b", // amber-500
  };

  const noise = useCallback(
    () => Math.random() * timeVariance - timeVariance / 2,
    [timeVariance]
  );

  const getXY = useCallback(
    (distance, pointR) => {
      const a = Math.random() * 2 * Math.PI;
      const r =
        Math.sqrt(Math.random()) * (distance / 2) + pointR / 2 + distance / 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    },
    []
  );

  const createParticle = useCallback(
    (x, y) => {
      const elm = document.createElement("span");
      elm.classList.add("particle");

      const [x1, y1] = getXY(particleDistances[0], particleR);
      const [x2, y2] = getXY(particleDistances[1], particleR);

      elm.style.cssText = `
        --x: ${x}px;
        --y: ${y}px;
        --start-x: ${x1}px;
        --start-y: ${y1}px;
        --end-x: ${x2}px;
        --end-y: ${y2}px;
        --time: ${animationTime + noise()}ms;
        --rotate: ${Math.round(Math.random() * 360)}deg;
      `;

      const point = document.createElement("span");
      point.classList.add("point");

      const colorIdx = colors[Math.floor(Math.random() * colors.length)];
      point.style.cssText = `
        --color: ${COLOR_MAP[colorIdx] || "#6366f1"};
        --scale: ${Math.random() * 0.5 + 0.5};
        --time: ${animationTime + noise()}ms;
      `;

      elm.appendChild(point);

      return elm;
    },
    [animationTime, noise, getXY, particleCount, particleDistances, particleR, colors]
  );

  const handleClick = useCallback(
    (index) => {
      if (index === active) return;
      setActive(index);
    },
    [active]
  );

  useEffect(() => {
    const container = containerRef.current;
    const nav = navRef.current;
    const filter = filterRef.current;
    const text = textRef.current;

    if (!container || !nav || !filter || !text) return;

    const activeItem = nav.querySelectorAll("li")[active];
    if (!activeItem) return;

    const navRect = nav.getBoundingClientRect();
    const r = activeItem.getBoundingClientRect();
    const x = r.left - navRect.left;
    const y = r.top - navRect.top;

    filter.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${r.width}px;
      height: ${r.height}px;
    `;
    text.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${r.width}px;
      height: ${r.height}px;
    `;

    filter.className = "effect filter active";
    text.className = "effect text active";
    text.textContent = items[active]?.label || "";

    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle(r.width / 2, r.height / 2);
      filter.appendChild(particle);
    }

    const timeout = setTimeout(() => {
      filter.className = "effect filter";
      text.className = "effect text";
      filter.querySelectorAll(".particle").forEach((p) => p.remove());
    }, animationTime + timeVariance + 100);

    return () => clearTimeout(timeout);
  }, [active, items, animationTime, particleCount, timeVariance, createParticle]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav ref={navRef}>
        <ul>
          {items.map((item, i) => (
            <li
              key={i}
              className={i === active ? "active" : ""}
              onClick={() => handleClick(i)}
            >
              <a href={item.href} onClick={(e) => {
                if (item.href?.startsWith('#')) {
                  e.preventDefault();
                  const el = document.querySelector(item.href);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef}></span>
      <span className="effect text" ref={textRef}></span>
    </div>
  );
};

export default GooeyNav;
