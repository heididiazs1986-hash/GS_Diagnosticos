<input type="file" id="inputImportGSX" accept=".json,.gsx,.gsx.json" style="display:none" onchange="importBackupGSX(event)">

<button type="button" onclick="document.getElementById('inputImportGSX').click()">
  Importar respaldo GSX
</button>

<script>
async function saveImportedData(data) {
  // 🔁 ADAPTA ESTA FUNCIÓN
  // Aquí debes volver a guardar en tu almacenamiento real
  window.registrosEstructuras = data.estructuras || [];
  window.registrosUNC = data.unc || [];
  window.registrosClientes = data.clientes || [];
  window.registrosSuspensiones = data.suspensiones || [];
  window.registrosBaldios = data.baldios || [];
}

async function importBackupGSX(event) {
  try {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed || !parsed.data) {
      throw new Error("Archivo GSX inválido");
    }

    await saveImportedData(parsed.data);

    setExportStatus("✅ Respaldo importado");
    showToast("Respaldo GSX importado correctamente");
  } catch (err) {
    console.error(err);
    setExportStatus("❌ Error importando GSX");
    alert("No se pudo importar el respaldo GSX.");
  } finally {
    event.target.value = "";
  }
}
</script>
