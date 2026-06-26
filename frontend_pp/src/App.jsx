import "./App.css";
import CardPedidoProduto from "./components/historicoPedido/CardPedidoProduto";

function App() {
  return (
    <>
      <CardPedidoProduto
        produto={{
          id: "p3",
          item_pedido_nome_produto:
            "Camiseta Basica Rosa. É para pet, também pra sua mãe ou seu pai. Mas eles não ficarão tão fofos assim.",
          item_pedido_quantidade: 1,
          imagem:
            "https://m.media-amazon.com/images/I/71UmzTwO2vL._AC_UL320_.jpg",
          item_pedido_preco: "49.90",
        }}
        onComprarNovamente={(produto) => {
          console.log("Comprar novamente:", produto);
        }}
      />
    </>
  );
}

export default App;
