// this function just create game class and property that needed
const startGame = () => {
  const gameData = {};
  gameData.items = items;
  gameData.reelCount = 3;
  gameData.spinTime = 3500;
  gameData.startScore = 100;
  gameData.mode = items.modes.random;
  gameData.dataPayTable = dataPayTable;
  gameData.redLine = document.getElementById("red-line");
  gameData.payTable = document.getElementById("payTable");
  gameData.modal = document.getElementById("modal-container");
  gameData.closeModal = document.getElementById("closeModal");
  gameData.scoreContainer = document.getElementById("credit");
  gameData.spinButton = document.getElementById("spin-button");
  gameData.lineSelect = document.getElementById("select-line");
  gameData.switchButton = document.getElementById("switch-button");
  gameData.background = document.getElementById("background-blur");
  gameData.symbolSelect = document.getElementById("select-symbole");
  gameData.reelContainer = document.getElementById("reelContainer");
  gameData.spinFixedButton = document.getElementById("fixed-button");
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
    dataPayTable,
    reelContainer,
    reelCount,
    reelItmes,
    redLine,
    scoreContainer,
    spinButton,
    switchButton,
    background,
    modal,
    spinFixedButton,
    symbolSelect,
    lineSelect,
    closeModal,
  }) {
    this.mode = mode;
    this.score = startScore;
    this.spinTime = spinTime;
    this.payTable = payTable;
    this.items = items;
    this.dataPayTable = dataPayTable;
    this.reelContainer = reelContainer;
    this.reelCount = reelCount;
    this.reelItmes = reelItmes;
    this.redLine = redLine;
    this.scoreContainer = scoreContainer;
    this.spinButton = spinButton;
    this.switchButton = switchButton;
    this.background = background;
    this.modal = modal;
    this.spinFixedButton = spinFixedButton;
    this.symbolSelect = symbolSelect;
    this.lineSelect = lineSelect;
    this.closeModal = closeModal;
  }

  // this method make table and reels
  preparePlayGround() {
    createPayTable(this.payTable, this.dataPayTable);
    createReels(this.reelCount, this.reelContainer, this.reelItmes);
    createSelectes(this.items, this.symbolSelect, this.lineSelect);
    this.spinButton.onclick = this.spin;
    this.switchButton.onchange = this.switchMode;
    this.spinFixedButton.onclick = this.fixedSpin;
    this.closeModal.onclick = () => this.toggleModal(false);
    this.scoreContainer.ondblclick = this.changeScoreByHand;
    this.updateScore(this.score);
  }

  // this method swich bewteen tow modes (random and fixed)
  switchMode = () => {
    if (this.mode === this.items.modes.random) {
      this.mode = this.items.modes.fixed;
      this.background.classList = "";
    } else {
      this.mode = this.items.modes.random;
      this.background.classList = "with-bg";
    }
  };

  // by pressing spin button this method will be called
  spin = () => {
    if (this.spining) return;
    this.removeBlinking(1);
    if (this.mode === this.items.modes.random) {
      const randomResult = this.spinResultRandom();
      this.spinAnimation(randomResult);
    } else {
      this.toggleModal(true);
    }
  };

  // in fixed mode spin button called this method
  fixedSpin = () => {
    const selectedSymbol = this.symbolSelect.value;
    const selectedLine = this.lineSelect.value;
    if (selectedSymbol && selectedLine) {
      this.toggleModal(false);
      const index = getIndexOfArray(this.items.availableItems, selectedSymbol);
      const fixedResult = [
        {
          symbol: this.items.availableItems[index],
          line: selectedLine,
        },
        {
          symbol: this.items.availableItems[index],
          line: selectedLine,
        },
        {
          symbol: this.items.availableItems[index],
          line: selectedLine,
        },
      ];
      this.spinAnimation(fixedResult);
      this.symbolSelect.style.color = "black";
      this.lineSelect.style.color = "black";
    } else {
      if (!selectedSymbol) {
        this.symbolSelect.style.color = "red";
      }
      if (!selectedLine) {
        this.lineSelect.style.color = "red";
      }
    }
  };

  // to hide and show modal (select line and symbol)
  toggleModal(status) {
    if (status) {
      this.modal.style.visibility = "visible";
    } else {
      this.modal.style.visibility = "hidden";
    }
  }

  // to active and deactive spin button
  toggleSpining(status) {
    if (status) {
      this.spinButton.classList.remove("active");
    } else {
      this.spinButton.classList.add("active");
    }
    this.spining = status;
  }

  // this method get the result first and start animate reels and stop on the result
  spinAnimation(result) {
    this.toggleSpining(true);
    if (!this.reels) {
      this.reels = this.reelContainer.getElementsByClassName("reel");
    }
    for (let i = 0; i < this.reels.length; i++) {
      const reel = this.reels[i];
      const reelScrollAble = reel.getElementsByClassName("reel-scroll-able")[0];
      reelScrollAble.classList.add("spin-animate");
      setTimeout(() => {
        reelScrollAble.classList.remove("spin-animate");
        reelScrollAble.classList.add("bounce-animate");
        reelScrollAble.style.top = result[i].symbol[result[i].line] + "px";
      }, this.spinTime - (this.reels.length - i) * 500);
    }
    setTimeout(() => {
      const scoreSpin = this.calculateScore(this.get3Lines(result));
      this.updateScore(scoreSpin);
      this.toggleSpining(false);
    }, this.spinTime);
    this.updateScore(-1);
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
    }
  };

  // when score changed to editable mode on blur this method called
  onBlurScoreContainer = () => {
    console.log(this.scoreContainer.innerText);
    this.scoreContainer.removeAttribute("contentEditable");
    this.scoreContainer.removeAttribute("onblur");
    const enterScore = this.scoreContainer.innerText;
    if (Number(enterScore) >= 1 && Number(enterScore) <= 5000) {
      this.updateScore(parseInt(this.scoreContainer.innerText), true);
      this.scoreContainer.classList.remove("editable-score");
    } else {
      alert("the input must be in range (1...5000)");
    }
  };

  // this mtheod get the row table and the line of reels and blink the table row and
  // and red line on the line
  blinkTableAndSlot(tableRow, reelRow) {
    const theRow = this.payTable.getElementsByClassName("row-pay-table")[
      tableRow
    ];
    theRow.classList.add("blinking-row");
    this.redLine.className = this.items.availablePosition[reelRow];
  }

  // this mthdo remove red line and blinked row of table
  removeBlinking = () => {
    this.redLine.className = "";
    const allRows = this.payTable.getElementsByClassName("row-pay-table");
    for (let i = 0; i < allRows.length; i++) {
      const element = allRows[i];
      element.classList.remove("blinking-row");
    }
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
}

// this is all items we need in this game
const items = {
  cherry: {
    name: "cherry",
  },
  se7en: {
    name: "se7en",
  },
  cherrySe7en: {
    name: "cherry-se7en",
  },
  bar: {
    name: "bar",
  },
  barX2: {
    name: "barX2",
  },
  barX3: {
    name: "barX3",
  },
  bars: {
    name: "bars",
  },
  position: {
    any: "any",
    top: "top",
    center: "center",
    bottom: "bottom",
  },
  availablePosition: ["top", "center", "bottom"],
  availableItems: [
    {
      name: "cherry",
      center: -270,
      top: -360,
      bottom: -180,
    },
    {
      name: "se7en",
      center: -180,
      top: -270,
      bottom: -90,
    },
    {
      name: "bar",
      center: 0,
      top: -90,
      bottom: -360,
    },
    {
      name: "barX2",
      center: -90,
      top: -180,
      bottom: 0,
    },
    {
      name: "barX3",
      center: -360,
      top: 0,
      bottom: -270,
    },
  ],
  modes: {
    random: "random",
    fixed: "fixed",
  },
};

// this is data used in pay-table
const dataPayTable = [
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.bottom,
    score: 4000,
  },
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.top,
    score: 2000,
  },
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.center,
    score: 1000,
  },
  {
    items: [items.se7en.name, items.se7en.name, items.se7en.name],
    position: items.position.any,
    score: 150,
  },
  {
    items: [
      items.cherrySe7en.name,
      items.cherrySe7en.name,
      items.cherrySe7en.name,
    ],
    position: items.position.any,
    score: 75,
    combines: ["cherry", "se7en"],
  },
  {
    items: [items.barX3.name, items.barX3.name, items.barX3.name],
    position: items.position.any,
    score: 50,
  },
  {
    items: [items.barX2.name, items.barX2.name, items.barX2.name],
    position: items.position.any,
    score: 20,
  },
  {
    items: [items.bar.name, items.bar.name, items.bar.name],
    position: items.position.any,
    score: 10,
  },
  {
    items: [items.bars.name, items.bars.name, items.bars.name],
    position: items.position.any,
    score: 5,
    combines: ["bar", "barX2", "barX3"],
  },
];

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

// this function create pay-table
const createPayTable = (table, dataTable) => {
  dataTable.forEach((row) => {
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
    table.appendChild(divRow);
  });
};

// this functon crete reels in solot machine
const createReels = (reelCount, reelContainer, reelItmes) => {
  for (let i = 0; i < reelCount; i++) {
    const reel = document.createElement("div");
    reel.classList.add("reel");
    const reelScrollAble = document.createElement("div");
    reelScrollAble.className = "reel-scroll-able";
    reelItmes.forEach((item) => {
      const card = document.createElement("span");
      card.classList.add("card");
      card.classList.add(item);
      reelScrollAble.appendChild(card);
    });
    reel.appendChild(reelScrollAble);
    const reelShadow = document.createElement("div");
    reelShadow.classList.add("reel-shadow");
    reelShadow.innerHTML = "<span class='reel-shadow-light'></span>";
    const reelShadowContainer = document.createElement("div");
    reelShadowContainer.classList.add("reel-shadow-container");
    reelShadowContainer.appendChild(reel);
    reelShadowContainer.appendChild(reelShadow);
    reelContainer.appendChild(reelShadowContainer);
  }
};

// this functon create select opetion in modal (in fixed mode to select symbol and line)
const createSelectes = (items, symbolSelect, lineSelect) => {
  const symbols = items.availableItems;
  const lines = items.availablePosition;

  symbols.forEach((sym) => {
    const option = document.createElement("option");
    option.innerHTML = sym.name;
    option.value = sym.name;
    symbolSelect.appendChild(option);
  });
  lines.forEach((line) => {
    const option = document.createElement("option");
    option.innerHTML = line;
    option.value = line;
    lineSelect.appendChild(option);
  });
};

// start game call after all loaded
(function () {
  startGame();
})();
