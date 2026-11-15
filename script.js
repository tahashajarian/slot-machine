// this function just create game class and property that needed
const startGame = () => {
  const gameData = {};
  gameData.items = items;
  gameData.reelCount = 3;
  gameData.spinTime = 3000;
  gameData.startScore = 200;
  gameData.mode = items.modes.random;
  gameData.dataPayTable = dataPayTable;
  gameData.redLine = document.getElementById("red-line");
  const payTableElement = document.getElementById("payTable");
  gameData.reelContainer = document.getElementById("reelContainer");
  gameData.payTable = new PayTable(payTableElement, dataPayTable);
  gameData.modal = document.getElementById("modal-container");
  gameData.closeModal = document.getElementById("closeModal");
  gameData.scoreContainer = document.getElementById("credit");
  gameData.spinButton = document.getElementById("spin-button");
  gameData.lineSelect = document.getElementById("select-line");
  gameData.switchButton = document.getElementById("switch-button");
  gameData.background = document.getElementById("background-blur");
  gameData.symbolOptions = document.getElementById("select-symbole");
  gameData.spinFixedButton = document.getElementById("fixed-button");
  gameData.ui = {
    cabinet: document.querySelector(".cabinet"),
    bulbs: document.querySelector(".bulbs"),
    winBanner: document.getElementById("win-banner"),
    balance: document.getElementById("balance"),
    balanceHint: document.getElementById("balance-hint"),
    refillButton: document.getElementById("refill-button"),
    soundButton: document.getElementById("sound-button"),
    lever: document.getElementById("lever"),
  };
  gameData.sound = new SoundFx();
  gameData.reelItmes = [
    items.barX3.name,
    items.bar.name,
    items.barX2.name,
    items.se7en.name,
    items.cherry.name,
    items.barX3.name,
    items.bar.name,
    items.barX2.name,
  ];
  gameData.slot = new Slot(
    gameData.reelCount,
    gameData.reelContainer,
    gameData.reelItmes,
    gameData.spinTime,
    (last) => gameData.sound.stop(last)
  );
  const gameManager = new GameManager({ ...gameData });
  gameManager.preparePlayGround();
};

// this class is main part of game and controll every thing
class GameManager {
  constructor({
    payTable,
    mode,
    startScore,
    spinTime,
    items,
    reelCount,
    reelItmes,
    redLine,
    scoreContainer,
    spinButton,
    switchButton,
    background,
    modal,
    spinFixedButton,
    symbolOptions,
    lineSelect,
    closeModal,
    slot,
    ui,
    sound,
  }) {
    this.mode = mode;
    this.score = startScore;
    this.spinTime = spinTime;
    this.payTable = payTable;
    this.items = items;
    this.reelCount = reelCount;
    this.reelItmes = reelItmes;
    this.redLine = redLine;
    this.scoreContainer = scoreContainer;
    this.spinButton = spinButton;
    this.switchButton = switchButton;
    this.background = background;
    this.modal = modal;
    this.spinFixedButton = spinFixedButton;
    this.symbolOptions = symbolOptions;
    this.lineSelect = lineSelect;
    this.closeModal = closeModal;
    this.slot = slot;
    this.ui = ui;
    this.sound = sound;
    this.startScore = startScore;
    this.selectedSymbol = "";
    this.selectedLine = "";
  }

  // this method make table and reels
  preparePlayGround() {
    this.payTable.createPayTable();
    this.slot.createReels();
    this.createSelectes(this.items, this.symbolOptions, this.lineSelect);
    this.createBulbs(28);
    this.spinButton.onclick = this.spin;
    this.ui.lever.onclick = this.spin;
    this.switchButton.onchange = this.switchMode;
    this.spinFixedButton.onclick = this.fixedSpin;
    this.closeModal.onclick = () => this.toggleModal(false);
    this.modal.onclick = (e) => {
      if (e.target === this.modal) this.toggleModal(false);
    };
    this.scoreContainer.ondblclick = this.changeScoreByHand;
    this.scoreContainer.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.scoreContainer.blur();
      }
    };
    this.ui.refillButton.onclick = this.refill;
    this.ui.soundButton.onclick = () => {
      const muted = this.sound.toggle();
      this.ui.soundButton.classList.toggle("muted", muted);
      this.ui.soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    };
    document.addEventListener("keydown", this.onKeyDown);
    this.updateScore(this.startScore, true);
  }

  // Space / Enter spins, Escape closes the dialog
  onKeyDown = (e) => {
    if (this.scoreContainer.isContentEditable) return;
    const modalOpen = this.modal.classList.contains("open");
    if (e.key === "Escape" && modalOpen) {
      this.toggleModal(false);
      return;
    }
    if (e.code !== "Space" && e.key !== "Enter") return;
    // let a focused button or checkbox handle its own key
    if (e.target.closest && e.target.closest("button, input")) return;
    e.preventDefault();
    if (modalOpen) this.fixedSpin();
    else this.spin();
  };

  // marquee light bulbs along the top of the cabinet
  createBulbs(count) {
    for (let i = 0; i < count; i++) {
      const bulb = document.createElement("i");
      bulb.style.animationDelay = `${(i % 7) * -0.23}s`;
      this.ui.bulbs.appendChild(bulb);
    }
  }

  setHint(text, warn = false) {
    this.ui.balanceHint.textContent = text;
    this.ui.balanceHint.classList.toggle("warn", warn);
  }

  defaultHint() {
    this.setHint(
      this.mode === this.items.modes.fixed
        ? "double-click to edit"
        : "1 credit per spin"
    );
  }

  refill = () => {
    this.ui.refillButton.hidden = true;
    this.updateScore(this.startScore, true);
    this.defaultHint();
  };

  flashBalance(className) {
    const el = this.ui.balance;
    el.classList.remove("success", "fail");
    void el.offsetWidth;
    el.classList.add(className);
    clearTimeout(this.balanceTimer);
    this.balanceTimer = setTimeout(() => el.classList.remove(className), 1600);
  }

  // this method swich bewteen tow modes (random and fixed)
  switchMode = () => {
    if (this.mode === this.items.modes.random) {
      this.mode = this.items.modes.fixed;
      this.background.classList = "";
      this.ui.refillButton.hidden = true;
    } else {
      this.mode = this.items.modes.random;
      this.background.classList = "with-bg";
    }
    this.defaultHint();
  };

  // by pressing spin button this method will be called
  spin = () => {
    if (this.spining) return;
    this.sound.unlock();
    if (this.score < 1) {
      this.flashBalance("fail");
      this.setHint("out of credit", true);
      if (this.mode === this.items.modes.random) this.ui.refillButton.hidden = false;
      return;
    }
    this.removeBlinking();
    if (this.mode === this.items.modes.random) {
      const randomResult = this.spinResultRandom();
      this.spinAnimation(randomResult);
    } else {
      this.toggleModal(true);
    }
  };

  // in fixed mode spin button called this method
  fixedSpin = () => {
    const selectedSymbol = this.selectedSymbol;
    const selectedLine = this.selectedLine;
    if (selectedSymbol && selectedLine) {
      this.toggleModal(false);
      const index = getIndexOfArray(this.items.availableItems, selectedSymbol);
      const fixedResult = [];
      for (let i = 0; i < this.reelCount; i++) {
        fixedResult[i] = {
          symbol: this.items.availableItems[index],
          line: selectedLine,
        };
      }

      this.spinAnimation(fixedResult);
    } else {
      [
        [selectedSymbol, this.symbolOptions],
        [selectedLine, this.lineSelect],
      ].forEach(([value, row]) => {
        if (value) return;
        row.classList.remove("invalid");
        void row.offsetWidth;
        row.classList.add("invalid");
      });
    }
  };

  // to hide and show modal (select line and symbol)
  toggleModal(status) {
    this.modal.classList.toggle("open", status);
  }

  // to active and deactive spin button
  toggleSpining(status) {
    if (status) {
      this.spinButton.classList.remove("active");
    } else {
      this.spinButton.classList.add("active");
    }
    this.spinButton.setAttribute("aria-disabled", String(status));
    this.ui.cabinet.classList.toggle("spinning", status);
    this.spining = status;
  }

  // this method get the result first and start animate reels and stop on the result
  spinAnimation(result) {
    this.toggleSpining(true);
    this.pullLever();
    this.sound.startReels();
    this.slot.spin(result);
    this.setHint("good luck");
    setTimeout(() => {
      const scoreSpin = this.calculateScore(this.get3Lines(result));
      this.updateScore(scoreSpin);
      this.toggleSpining(false);
      if (scoreSpin > 0) this.celebrate(scoreSpin);
      else this.defaultHint();
    }, this.spinTime);
    this.updateScore(-1);
  }

  pullLever() {
    const lever = this.ui.lever;
    lever.classList.add("pulled");
    this.spinButton.classList.add("pressed");
    setTimeout(() => {
      lever.classList.remove("pulled");
      this.spinButton.classList.remove("pressed");
    }, 260);
  }

  // win banner, flashing bulbs and a chime
  celebrate(amount) {
    const banner = this.ui.winBanner;
    banner.textContent = `+${amount}`;
    banner.classList.remove("show");
    void banner.offsetWidth;
    banner.classList.add("show");
    this.flashBalance("success");
    this.setHint(amount >= 150 ? "big win!" : "winner");
    this.sound.win(amount);
    const cabinet = this.ui.cabinet;
    cabinet.classList.add("winning");
    clearTimeout(this.winTimer);
    this.winTimer = setTimeout(() => cabinet.classList.remove("winning"), 2000);
  }

  // this method return a random result for 3 reel (used in random mode)
  spinResultRandom() {
    const randomResult = [];
    for (let i = 0; i < this.reelCount; i++) {
      randomResult[i] = {
        symbol: randomItemFromAraay(this.items.availableItems),
        line: randomItemFromAraay(this.items.availablePosition),
      };
    }
    return randomResult;
  }

  // this method get the 3 lines shown sybmol
  // and stat check matching from top of pay-table
  // and return match score
  // and also return index of tabel row and line of reels for blinking
  calculateScore(lines) {
    for (let i = 0; i < dataPayTable.length; i++) {
      let activeLines = [];
      let blinkLine;
      const element = dataPayTable[i];
      const itemsRow = element.items;
      const line = element.position;
      const score = element.score;
      const combines = element.combines;
      if (line === items.position.bottom) {
        activeLines = [[...lines[2]]];
        blinkLine = 2;
      } else if (line === items.position.top) {
        activeLines = [[...lines[0]]];
        blinkLine = 0;
      } else if (line === items.position.center) {
        activeLines = [[...lines[1]]];
        blinkLine = 1;
      } else {
        activeLines = lines;
        blinkLine = -1;
      }
      for (let j = 0; j < activeLines.length; j++) {
        if (combines) {
          if (
            combines.includes(activeLines[j][0]) &&
            combines.includes(activeLines[j][1]) &&
            combines.includes(activeLines[j][2])
          ) {
            if (blinkLine < 0) blinkLine = j;
            this.blinkTableAndSlot(i, blinkLine);
            return score;
          }
        } else {
          if (JSON.stringify(activeLines[j]) === JSON.stringify(itemsRow)) {
            if (blinkLine < 0) blinkLine = j;
            this.blinkTableAndSlot(i, blinkLine);
            return score;
          }
        }
      }
    }
    return 0;
  }

  // on dbclink on score this mthod called and in fixed mode change score to editable mode
  changeScoreByHand = () => {
    if (this.mode === this.items.modes.random) {
      return;
    } else {
      this.scoreContainer.onblur = this.onBlurScoreContainer;
      this.scoreContainer.contentEditable = "true";
      this.scoreContainer.classList.add("editable-score");
      this.scoreContainer.focus();
      document.getSelection().selectAllChildren(this.scoreContainer);
    }
  };

  // when score changed to editable mode on blur this method called
  onBlurScoreContainer = () => {
    this.scoreContainer.removeAttribute("contentEditable");
    this.scoreContainer.removeAttribute("onblur");
    const enterScore = this.scoreContainer.innerText;
    if (Number(enterScore) >= 1 && Number(enterScore) <= 5000) {
      this.updateScore(parseInt(this.scoreContainer.innerText), true);
      this.defaultHint();
    } else {
      this.scoreContainer.innerText = this.score;
      this.flashBalance("fail");
      this.setHint("enter 1 to 5000", true);
    }
    this.scoreContainer.classList.remove("editable-score");
  };

  // this mtheod get the row table and the line of reels and blink the table row and
  // and red line on the line
  blinkTableAndSlot(rowId, reelRow) {
    this.payTable.blink(rowId);
    this.redLine.className = this.items.availablePosition[reelRow];
  }

  // this mthdo remove red line and blinked row of table
  removeBlinking = () => {
    this.redLine.className = "";
    this.payTable.removeBlinking();
  };

  // this method get the score and update score by add property to curren score
  // if force property was true the score will equil of score propery (not add)
  updateScore(score, force) {
    if (force) {
      this.score = score;
    } else {
      this.score = this.score + score;
    }
    animateValue(this.scoreContainer, this.score, 1500);
  }

  // for calculate score we need the all three line and this mehod get the reslut
  // and return three line shown in slot machine
  get3Lines(result) {
    const lines = [[], [], []];
    const calcIndex = (index) => {
      const lengthItems = this.items.availableItems.length;
      if (index >= lengthItems) {
        return index % lengthItems;
      }
      if (index < 0) {
        return lengthItems + index;
      }
      return index;
    };
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const index = this.reelItmes.indexOf(element.symbol.name);
      if (element.line === items.availablePosition[0]) {
        lines[0][i] = element.symbol.name;
        lines[1][i] = this.reelItmes[calcIndex(index + 1)];
        lines[2][i] = this.reelItmes[calcIndex(index + 2)];
      } else if (element.line === items.availablePosition[1]) {
        lines[0][i] = this.reelItmes[calcIndex(index - 1)];
        lines[1][i] = element.symbol.name;
        lines[2][i] = this.reelItmes[calcIndex(index + 1)];
      } else {
        lines[0][i] = this.reelItmes[calcIndex(index - 2)];
        lines[1][i] = this.reelItmes[calcIndex(index - 1)];
        lines[2][i] = element.symbol.name;
      }
    }
    return lines;
  }

  // this functon create select opetion in modal (in fixed mode to select symbol and line)
  createSelectes(items, symbolOptions, lineSelect) {
    const symbols = items.availableItems;
    const lines = items.availablePosition;

    const makeTiles = (row, values, key, withIcon) => {
      values.forEach((value) => {
        const tile = document.createElement("button");
        tile.type = "button";
        if (withIcon) {
          tile.classList.add("card", value);
          tile.setAttribute("aria-label", value);
          tile.title = value;
        } else {
          tile.textContent = value;
        }
        tile.onclick = () => {
          this[key] = value;
          [...row.children].forEach((t) => t.classList.toggle("selected", t === tile));
        };
        row.appendChild(tile);
      });
    };
    makeTiles(symbolOptions, symbols.map((sym) => sym.name), "selectedSymbol", true);
    lineSelect.classList.add("lines");
    makeTiles(lineSelect, lines, "selectedLine", false);
  }
}

// this class create pay-table
class PayTable {
  constructor(tableElement, data) {
    this.tableElement = tableElement;
    this.data = data;
  }

  createPayTable() {
    this.data.forEach((row) => {
      const divRow = document.createElement("div");
      divRow.classList.add("row-pay-table");
      const divScore = document.createElement("div");
      divScore.innerHTML = row.score;
      divScore.classList.add("row-pay-table-score");
      const divPosition = document.createElement("div");
      divPosition.innerHTML = row.position;
      divPosition.classList.add("row-pay-table-position");
      const divItems = document.createElement("div");
      divItems.classList.add("row-pay-table-items");
      row.items.forEach((item) => {
        const spanItem = document.createElement("span");
        spanItem.classList.add("card");
        spanItem.classList.add(item);
        divItems.appendChild(spanItem);
      });
      divRow.appendChild(divItems);
      divRow.appendChild(divPosition);
      divRow.appendChild(divScore);
      this.tableElement.appendChild(divRow);
    });
  }

  removeBlinking() {
    const allRows = this.tableElement.getElementsByClassName("row-pay-table");
    for (let i = 0; i < allRows.length; i++) {
      const element = allRows[i];
      element.classList.remove("blinking-row");
    }
  }

  blink(rowId) {
    const theRow = this.tableElement.getElementsByClassName("row-pay-table")[
      rowId
    ];
    theRow.classList.add("blinking-row");
  }
}

// this class crete reels in solot machine
class Slot {
  constructor(reelCount, reelContainer, reelItmes, spinTime, onReelStop) {
    this.reelCount = reelCount;
    this.reelContainer = reelContainer;
    this.reelItmes = reelItmes;
    this.spinTime = spinTime;
    this.onReelStop = onReelStop;
  }

  createReels() {
    for (let i = 0; i < this.reelCount; i++) {
      const reel = document.createElement("div");
      reel.classList.add("reel");
      const reelScrollAble = document.createElement("div");
      reelScrollAble.className = "reel-scroll-able";
      this.reelItmes.forEach((item) => {
        const card = document.createElement("span");
        card.classList.add("card");
        card.classList.add(item);
        reelScrollAble.appendChild(card);
      });
      // start each reel on a random stop instead of all reels on the same row
      const start = randomItemFromAraay(items.availableItems);
      reelScrollAble.style.top = start[randomItemFromAraay(items.availablePosition)] + "px";
      reel.appendChild(reelScrollAble);
      const reelShadow = document.createElement("div");
      reelShadow.classList.add("reel-shadow");
      reelShadow.innerHTML = "<span class='reel-shadow-light'></span>";
      const reelShadowContainer = document.createElement("div");
      reelShadowContainer.classList.add("reel-shadow-container");
      reelShadowContainer.appendChild(reel);
      reelShadowContainer.appendChild(reelShadow);
      this.reelContainer.appendChild(reelShadowContainer);
    }
  }

  spin(result) {
    if (!this.reels) {
      this.reels = this.reelContainer.getElementsByClassName("reel");
    }
    for (let i = 0; i < this.reels.length; i++) {
      const reel = this.reels[i];
      const reelScrollAble = reel.getElementsByClassName("reel-scroll-able")[0];
      reelScrollAble.classList.remove("bounce-animate");
      reelScrollAble.classList.add("spin-animate");
      setTimeout(() => {
        reelScrollAble.classList.remove("spin-animate");
        reelScrollAble.classList.add("bounce-animate");
        reelScrollAble.style.top = result[i].symbol[result[i].line] + "px";
        if (this.onReelStop) this.onReelStop(i === this.reels.length - 1);
      }, this.spinTime - (this.reels.length - i) * 500);
    }
  }
}

// tiny synthesized sound effects (no audio files): reel ticks, stop thunks, win chime
class SoundFx {
  constructor() {
    this.muted = false;
    try {
      this.muted = localStorage.getItem("slot-muted") === "1";
    } catch (e) {}
    if (this.muted) {
      document.getElementById("sound-button").classList.add("muted");
    }
  }

  unlock() {
    if (this.ctx || this.muted) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  toggle() {
    this.muted = !this.muted;
    try {
      localStorage.setItem("slot-muted", this.muted ? "1" : "0");
    } catch (e) {}
    if (this.muted) this.stopTicks();
    else this.unlock();
    return this.muted;
  }

  tone(freq, start, duration, type = "sine", volume = 0.5) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  startReels() {
    this.stopTicks();
    this.tickTimer = setInterval(() => {
      this.tone(1400 + Math.random() * 300, 0, 0.03, "square", 0.08);
    }, 70);
  }

  stopTicks() {
    clearInterval(this.tickTimer);
  }

  stop(last) {
    this.tone(140, 0, 0.18, "triangle", 0.7);
    this.tone(90, 0, 0.12, "sine", 0.5);
    if (last) this.stopTicks();
  }

  win(amount) {
    const notes = amount >= 150 ? [523, 659, 784, 1047, 1319] : [659, 784, 1047];
    notes.forEach((f, i) => {
      this.tone(f, i * 0.09, 0.35, "triangle", 0.35);
      this.tone(f * 2, i * 0.09, 0.2, "sine", 0.08);
    });
  }
}

// this function is effect to update socre and get
// the object is elemnt that gonna change and the end that is final number and the time for duration update the number
const animateValue = (obj, end, duration) => {
  let startTimestamp = null;
  const start = Number(obj.innerText);
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

// this funtion get an array and return a random item in that array
var randomItemFromAraay = (items) => {
  return items[Math.floor(Math.random() * items.length)];
};

// this funtion get an array of option and item and return a index of that object contain the item
const getIndexOfArray = (array, name) => {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element.name === name) return i;
  }
  return 0;
};

// start game call after all loaded
(function () {
  startGame();
})();
