let db;

async function loadDb(path)
{
    const SQL = await initSqlJs({
        locateFile: file =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });

    // Carregar banco
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();

    // Abrir banco
    db = new SQL.Database(new Uint8Array(buffer));

    document.querySelectorAll(".run-btn")
    .forEach(btn => {
        btn.disabled = false;
    })
}

function datatable(data, result_idx)
{
    const tbl = document.createElement("table");
    tbl.className = "datatable";

    const header_labels = data[result_idx].columns;

    for (const label of header_labels)
    {
        const col = document.createElement("col");
        col.className = label;
        tbl.appendChild(col);
    }

    // Header
    const thead = tbl.createTHead();
    const row = thead.insertRow(0);

    for (const label of header_labels)
    {
        const cell = document.createElement("th");
        cell.textContent = label;
        row.appendChild(cell);
    }

    // Body
    const tbody = document.createElement("tbody");

    for (const row_idx in data[result_idx].values)
    {
        const body_row = tbody.insertRow();

        for (const header_idx in header_labels)
        {
            const body_cell = body_row.insertCell();
            body_cell.appendChild(
                document.createTextNode(
                    data[result_idx].values[row_idx][header_idx]
                )
            );
        }
    }

    tbl.appendChild(tbody);
    return tbl;
}

function initSqlBoxes()
{
    const boxes = document.querySelectorAll(".sql-box");

    boxes.forEach(box => {
        const textarea = box.querySelector(".sql-editor");
        const runBtn = box.querySelector(".run-btn");
        const clearBtn = box.querySelector(".clr-out");
        const resetBtn = box.querySelector(".reset-btn");
        const resultDiv = box.querySelector(".result-table")

        const defaultValue = textarea.value;

        const editorSQL = CodeMirror.fromTextArea(textarea, {
                mode: "text/x-sql",
                lineNumbers: true,
                theme: "default",
                viewportMargin: Infinity
        });
        
        editorSQL.setSize(null, "auto");

        runBtn.addEventListener("click", runQuery);
        clearBtn.addEventListener("click", clearOutput);
        resetBtn.addEventListener("click", () => resetQuery(defaultValue));

        function runQuery()
        {
            var query = editorSQL.getValue();

            try {
                const result = db.exec(query);
                resultDiv.innerHTML = "";

                if (result.length === 0)
                {
                    resultDiv.innerHTML = "<p>Nenhum resultado encontrado.</p>";
                    return;
                }

                for (let i = 0; i < result.length; i++)
                {
                    const table = datatable(result, i);
                    const wrapper = document.createElement("div");
                    wrapper.className = "table-wrapper";
                    wrapper.appendChild(table);
                    resultDiv.appendChild(wrapper);
                }
            } catch (err) {

                resultDiv.innerHTML =
                    "<p style='color:red;'>Erro na sintaxe SQL: "
                    + err.message +
                    "</p>";
            }
        }

        function clearOutput()
        {
            resultDiv.innerHTML = "";
        }

        function resetQuery(value)
        {
            editorSQL.setValue(value);

            resultDiv.innerHTML = "";
        }
    });
}

initSqlBoxes();
loadDb("chinook.db");

document.querySelector("#show-schema")
.addEventListener("click", function (e) {

    e.preventDefault();

    document.querySelector("#experienced-schema")
        .classList.toggle("show");

});