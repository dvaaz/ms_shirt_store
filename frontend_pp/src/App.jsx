import "./App.css";
import HistoricoPedidos from "./pages/historicoPedidos/HistoricoPedidos";
function App() {
  return (
    <>
      <Route path="/pedidos" element={<HistoricoPedidos />} />
    </>
  );
}

export default App;
