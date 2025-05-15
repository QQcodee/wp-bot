"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "./ui/input";
import supabase from "@/config/supabaseClient";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { set } from "date-fns";
import { createClient } from "@supabase/supabase-js";

export function Carrito({
  cartItems = [],
  onUpdateCart,

  createTransaction,
}) {
  const [clientId, setClientId] = useState(null);
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState("");

  const [newName, setNewName] = useState("");
  const [clientNotFound, setClientNotFound] = useState(false);

  const buscarCliente = async () => {
    if (!phone) return;
    const { data, error } = await supabase
      .from("clients")
      .select()
      .eq("phone", phone);

    if (error || data.length === 0) {
      console.error("Error fetching clients:", error);
      setClientNotFound(true);
    } else {
      setClientId(data[0].id);
      setClientName(data[0].name);
      toast.success("Bienvenido " + data[0].name);
    }
  };
  const calculateShippingFee = () => {
    return cartItems.reduce((total, item) => {
      const { quantity } = item;

      let feePerUnit = 20;
      if (quantity <= 5) {
        feePerUnit = 35;
      } else if (quantity <= 10) {
        feePerUnit = 25;
      }

      return total + quantity * feePerUnit;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!clientId || cartItems.length === 0) return;

    const selectedProducts = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    await createTransaction(clientId, selectedProducts);

    onUpdateCart([]);
  };

  const getSubtotal = () =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const shippingFee = calculateShippingFee();
  const subtotal = getSubtotal();
  const total = subtotal + shippingFee;

  const handleQuantityChange = (id, delta) => {
    onUpdateCart(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleRemove = (id) => {
    onUpdateCart(cartItems.filter((item) => item.id !== id));
  };

  const handleAddClient = async () => {
    const { data, error } = await supabase
      .from("clients")
      .insert([{ name: newName, phone: phone }])
      .select()
      .single();

    if (!error && data) {
      setClientId(data.id); // 👈 set clientId
      setClientName(data.name);
      toast.success("Numero registrado exitosamente");
      // Optionally reset inputs:
      setNewName("");
      setPhone("");
      setClientNotFound(false);
    } else {
      toast.error("Error al agregar cliente");
      console.error(error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">🛒 Ver carrito ({cartItems.length})</Button>
      </SheetTrigger>
      <SheetContent className="w-[80vw] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
          <SheetTitle className="flex items-center justify-center gap-2">
            {clientName && clientName}{" "}
            {clientName && (
              <X
                className="cursor-pointer text-red-600"
                onClick={() => {
                  setClientId(null);
                  setClientName("");
                  setPhone("");
                }}
              />
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
          {cartItems.length === 0 && (
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
          )}

          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 border-b pb-3">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-16 w-16 rounded object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} c/u
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(item.id)}
                    className="ml-auto text-red-500"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span>${shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-black">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div>
            {!clientId && (
              <div className="mt-5 flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Teléfono"
                  className="w-full"
                  value={phone}
                  onChange={(e) => {
                    const newPhone = e.target.value.replace(/\D/g, ""); // Remove non-digits
                    if (newPhone.length <= 10) {
                      setPhone(newPhone);
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />

                <Button type="button" className="" onClick={buscarCliente}>
                  Sig.
                </Button>
              </div>
            )}
          </div>

          <div>
            {clientNotFound && (
              <div className="mt-5 flex-col items-center space-y-3">
                <Input
                  type="text"
                  placeholder="Nombre y apellido"
                  className="w-full"
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleAddClient}
                >
                  Registrar
                </Button>
              </div>
            )}
          </div>

          <SheetFooter className="gap-2 pt-4">
            <SheetClose asChild>
              <Button
                type="button"
                className="w-full"
                disabled={cartItems.length === 0 || !clientId}
                onClick={handleCheckout}
              >
                Finalizar compra
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
