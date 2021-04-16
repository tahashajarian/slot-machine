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
  availablePosition: ["topPos", "centerPos", "bottomPos"],
  availableItems: [
    {
      name: "cherry",
      centerPos: -270,
      topPos: -360,
      bottomPos: -180,
    },
    {
      name: "se7en",
      centerPos: -180,
      topPos: -270,
      bottomPos: -90,
    },
    {
      name: "bar",
      centerPos: 0,
      topPos: -90,
      bottomPos: -360,
    },
    {
      name: "barX2",
      centerPos: -90,
      topPos: -180,
      bottomPos: 0,
    },
    {
      name: "barX3",
      centerPos: -360,
      topPos: 0,
      bottomPos: -270,
    },
  ],
  modes: {
    random: "random",
    fixed: "fixed",
  },
};

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

var randomItemFromAraay = (items) => {
  return items[Math.floor(Math.random() * items.length)];
};

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

const getIndexOfObject = (array, name) => {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element.name === name) return i;
  }
  return 0;
};

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

const createSelctes = (items, symbolSelect, lineSelect) => {
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
    option.innerHTML = line.replace("Pos", "");
    option.value = line;
    lineSelect.appendChild(option);
  });
};
