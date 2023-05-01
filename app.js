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
        onSelect(select, !node.IsFolder);
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
            <img src="out/${iconName.toLowerCase()}.edclassic.gbx.png" draggable="${false}"/>
        </div>
    `
}

function BlockPicker() {
    const [inventory, setInventory] = useState(null);
    const [folder, setFolder] = useState([]);
    const [index, setIndex] = useState("-0");
    const [clipboardText, setClipboardText] = useState(null);
    
    useEffect(() => {
        fetch("BlockInfoInventory.gbx.json")
            .then(resp => resp.json())
            .then(data => setInventory(data));
    }, []);
    
    const onSelect = useCallback((index, isItem) => {
        if (isItem)
        {
            let path = index.split("-").slice(1).map(x => parseInt(x) + 1).join("-");
            navigator.clipboard.writeText(path);
            setClipboardText(path);
        }
        else 
        {
            setClipboardText(null);
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
        ${
            clipboardText != null 
                ? html`<p style="color: white; font-style: italic">${clipboardText} was copied to the clipboard!</p>`
                : null
        }
    `;
}

function App() {
    return html`
        <div>
            <h1 style="color: white">Trackmania Block Picker</h1>
            <p style="color: lightgrey; font-style: italic">Clicking a block will copy its path to the clipboard.</p>
            <p style="color: lightgrey; font-style: italic">Not affiliated with or endorsed by Nadeo or Ubisoft. All relevant trademarks belong to their respective owners.</p>
        </div>
        <hr/>
        <${BlockPicker} />
    `;
}

render(html`<${App}/>`, document.body);