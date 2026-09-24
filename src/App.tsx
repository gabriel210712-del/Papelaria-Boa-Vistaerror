import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { OrderPrintView } from './components/OrderPrintView';
import { decodeOrder, OrderPayload } from './utils/orderEncoder';

/**
 * Papelaria Boa Vista - Aplicação Direta com Suporte a Visualização e Impressão de Pedidos em PDF
 */
export default function App() {
  const [order, setOrder] = useState<OrderPayload | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const pedidoParam = params.get('pedido') || params.get('order');
    if (pedidoParam) {
      return decodeOrder(pedidoParam);
    }
    return null;
  });

  const [shouldAutoPrint, setShouldAutoPrint] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('imprimir') === '1' || params.get('print') === '1';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const pedidoParam = params.get('pedido') || params.get('order');
      if (pedidoParam) {
        setOrder(decodeOrder(pedidoParam));
        setShouldAutoPrint(params.get('imprimir') === '1' || params.get('print') === '1');
      } else {
        setOrder(null);
        setShouldAutoPrint(false);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  if (order) {
    return (
      <OrderPrintView
        order={order}
        autoPrint={shouldAutoPrint}
        onBack={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setOrder(null);
        }}
      />
    );
  }

  return <LandingPage />;
}
