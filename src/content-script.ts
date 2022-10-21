import {
  effect,
  EffectScope,
  onScopeDispose,
  Ref,
  shallowRef,
} from "@vue/reactivity";

const useIntervalFn = (fn: () => void, ms: number): void => {
  const timer = setInterval(fn, ms);
  onScopeDispose(() => {
    clearInterval(timer);
  });
};

const totalTimes = new Map<string, Ref<number>>();
const totalTime = (name: string): Ref<number> => {
  let t = totalTimes.get(name);
  if (t === undefined) {
    t = shallowRef(0);
    totalTimes.set(name, t);
  }
  return t;
};

const showTimers = shallowRef(true);
function setupPanel(panel: Element): void {
  const readDOM = () => {
    const nameLabel = panel.querySelector(".XEazBc, .ZGDE");
    const name = nameLabel?.firstChild?.nodeValue ?? null;
    return {
      nameLabel,
      name,
      gaugeClass: panel.querySelector(".IisKdb")?.className ?? null,
    };
  };

  const domState = shallowRef(readDOM());
  const obs = new MutationObserver(() => {
    domState.value = readDOM();
  });
  obs.observe(panel, {
    childList: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  const timerLabel = shallowRef<HTMLDivElement | null>(null);
  effect(() => {
    const { nameLabel } = domState.value;
    if (nameLabel === null || nameLabel.shadowRoot !== null) {
      return;
    }
    const shadow = nameLabel.attachShadow({ mode: "open" });

    const label = document.createElement("div");
    shadow.appendChild(label);
    timerLabel.value = label;
  });

  effect(() => {
    const { name } = domState.value;
    if (timerLabel.value === null || name === null) {
      return;
    }

    const t = totalTime(name).value;
    const m = Math.floor(t / 60).toString();
    const s = (t % 60).toString().padStart(2, "0");
    timerLabel.value.innerText = showTimers.value
      ? `${name} - ${m}:${s}`
      : name;
  });

  let lastSpeakingAt = 0;
  effect(() => {
    const { gaugeClass } = domState.value;
    if (gaugeClass === null) {
      return;
    }

    const speaking = !gaugeClass.includes("gjg47c");
    if (speaking) {
      lastSpeakingAt = Date.now();
    }
  });

  useIntervalFn(() => {
    const { name } = domState.value;
    if (name === null) {
      return;
    }

    if (Date.now() - lastSpeakingAt < 1000) {
      totalTime(name).value++;
    }
  }, 1000);
}

const panels = new Set<Element>();
setInterval(() => {
  for (const panel of document.querySelectorAll(".oZRSLe, .aGWPv")) {
    if (panels.has(panel)) {
      continue;
    }
    panels.add(panel);
    showTimers.value = panels.size < 10;

    const scope = new EffectScope();
    scope.run(() => {
      setupPanel(panel);
      useIntervalFn(() => {
        if (!panel.isConnected) {
          scope.stop();
          panels.delete(panel);
          showTimers.value = panels.size < 10;
        }
      }, 1000);
    });
  }
}, 1000);
