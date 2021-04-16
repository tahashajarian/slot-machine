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
    createSelctes(this.items, this.symbolSelect, this.lineSelect);
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

  fixedSpin = () => {
    const selectedSymbol = this.symbolSelect.value;
    const selectedLine = this.lineSelect.value;
    if (selectedSymbol && selectedLine) {
      this.toggleModal(false);
      const index = getIndexOfObject(this.items.availableItems, selectedSymbol);
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

  toggleModal(status) {
    if (status) {
      this.modal.style.visibility = "visible";
    } else {
      this.modal.style.visibility = "hidden";
    }
  }

  toggleSpining(status) {
    if (status) {
      this.spinButton.classList.remove("active");
    } else {
      this.spinButton.classList.add("active");
    }
    this.spining = status;
  }

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

  spinResultRandom() {
    return [
      {
        symbol: randomItemFromAraay(this.items.availableItems),
        line: randomItemFromAraay(this.items.availablePosition),
      },
      {
        symbol: randomItemFromAraay(this.items.availableItems),
        line: randomItemFromAraay(this.items.availablePosition),
      },
      {
        symbol: randomItemFromAraay(this.items.availableItems),
        line: randomItemFromAraay(this.items.availablePosition),
      },
    ];
  }

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

  changeScoreByHand = () => {
    if (this.mode === this.items.modes.random) {
      return;
    } else {
      this.scoreContainer.onblur = this.onBlurScoreContainer;
      this.scoreContainer.contentEditable = "true";
      this.scoreContainer.classList.add("editable-score");
    }
  };

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

  blinkTableAndSlot(tableRow, reelRow) {
    const theRow = this.payTable.getElementsByClassName("row-pay-table")[
      tableRow
    ];
    theRow.classList.add("blinking-row");
    this.redLine.className = this.items.availablePosition[reelRow];
  }

  removeBlinking = (x) => {
    this.redLine.className = "";
    const allRows = this.payTable.getElementsByClassName("row-pay-table");
    for (let i = 0; i < allRows.length; i++) {
      const element = allRows[i];
      element.classList.remove("blinking-row");
    }
  };

  updateScore(score, force) {
    if (force) {
      this.score = score;
    } else {
      this.score = this.score + score;
    }
    animateValue(this.scoreContainer, this.score, 1500);
  }

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

// this function just create game class and property that needed
const startGame = () => {
  const gameData = {};
  gameData.items = items;
  gameData.mode = items.modes.random;
  gameData.spinTime = 3500;
  gameData.startScore = 100;
  gameData.dataPayTable = dataPayTable;
  gameData.payTable = document.getElementById("payTable");
  gameData.reelContainer = document.getElementById("reelContainer");
  gameData.redLine = document.getElementById("red-line");
  gameData.scoreContainer = document.getElementById("credit");
  gameData.spinButton = document.getElementById("spin-button");
  gameData.switchButton = document.getElementById("switch-button");
  gameData.background = document.getElementById("background-blur");
  gameData.modal = document.getElementById("modal-container");
  gameData.spinFixedButton = document.getElementById("fixed-button");
  gameData.symbolSelect = document.getElementById("select-symbole");
  gameData.lineSelect = document.getElementById("select-line");
  gameData.closeModal = document.getElementById("closeModal");
  gameData.reelCount = 3;
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
  const gameManagert = new GameManager({ ...gameData });
  gameManagert.preparePlayGround();
};

// start game call after all loaded
(function () {
  startGame();
})();
