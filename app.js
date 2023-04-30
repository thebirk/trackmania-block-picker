import { render } from 'https://esm.sh/preact@10.7.2';
import { useEffect, useState, useCallback } from 'https://esm.sh/preact@10.7.2/hooks';
import { html } from 'https://esm.sh/htm@3.0.4/preact';

function FindRootOfNode(node) {
    if (node.IsFolder == true)
    {
        return FindRootOfNode(node.Childs[0]);
    }

    return node;
}

function Folder(props) {
    const { node, iconName, index, onSelect, prevIndex, active } = props;
    const onClick = useCallback(() => {
        let select = prevIndex + "-" + index.toString();
        onSelect(select, true);
    }, [props]);

    let cls = "folder";
    if (!node.IsFolder)
    {
        cls += " folder--block";
    }
    if (active)
    {
        cls += " folder--active";
    }
    
    return html`
        <div class="${cls}" onclick="${onClick}">
            <span>${node.IsFolder ? (index + 1) : (prevIndex + "-" + index.toString()).split("-").slice(1).map(x => parseInt(x) + 1).join("-")}</span>
            <img src="out/${iconName}.EDClassic.Gbx.png" draggable="${false}"/>
        </div>
    `
}

function BlockPicker() {
    const [inventory, setInventory] = useState(null);
    const [folder, setFolder] = useState([]);
    const [index, setIndex] = useState("-0");
    
    useEffect(() => {
        fetch("BlockInfoInventory.gbx.json")
            .then(resp => resp.json())
            .then(data => setInventory(data));
    }, []);

    if (inventory != null)
    {
        console.log(inventory);
    }
    
    const onSelect = useCallback((index, isItem) => {
        if (isItem)
        {
            navigator.clipboard.writeText(index.split("-").slice(1).map(x => parseInt(x) + 1).join("-"));
        }

        setIndex(index);
    }, []);

    
    useEffect(() => {
        if (inventory != null)
        {
            setFolder(inventory.RootChilds.map((x, index) => html`<${Folder} node=${x} iconName="${FindRootOfNode(x).Name}" index="${index}" onSelect=${onSelect}/>`));
        }
    }, [inventory])

    useEffect(() => {
        if (inventory == null) return;

        let indices = index.split("-").slice(1);
        let folder = [inventory.RootChilds.map((x, index) => html`<${Folder} node=${x} iconName="${FindRootOfNode(x).Name}" prevIndex="" index="${index}" active=${index == indices[0]} onSelect=${onSelect}/>`)];

        let prevIndex = "";
        let node = inventory.RootChilds[indices[0]];
        while (node != null)
        {
            prevIndex += "-" + indices[0];
            indices = indices.slice(1);
            
            if (node.IsFolder)
            {
                folder = [...folder, html`<hr/>`, node.Childs.map((x, index) => html`<${Folder} node=${x} iconName="${FindRootOfNode(x).Name}" prevIndex="${prevIndex}" index="${index}" active=${index == indices[0]} onSelect=${onSelect}/>`)];
                node = node.Childs[indices[0]];
            }
            else
            {
                node = null;
            }
        }

        setFolder(folder);
    }, [inventory, index]);

    return html`
        ${folder}
    `;
}

function App() {
    const [inventory, setInventory] = useState(null);
    
    useEffect(() => {
        fetch("/BlockInfoInventory.gbx.json")
            .then(resp => resp.json())
            .then(data => setInventory(data));
    }, []);

    return html`
        <h1 style="color: white">Trackmania Block Picker</h1>
        <${BlockPicker} />
    `;
}

render(html`<${App}/>`, document.body);