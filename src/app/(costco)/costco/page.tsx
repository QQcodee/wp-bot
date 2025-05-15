"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/config/supabaseClient";
import { toast } from "react-toastify";

export default function ClientProductManager() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clientForm, setClientForm] = useState({ name: "", phone: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "" });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchClients();
    //fetchProducts();
    fetchTransactions(); // Fetch the initial list of transactions

    const channel = supabase
      .channel("transactions-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Listen for insert events
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          console.log("New transaction added:", payload.new);
          fetchTransactions(); // Refresh the transactions list after a new one is added
        },
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        created_at,
        clients (
          name,
          phone
        ),
        transaction_products (
          quantity,
          products (
            name,
            price
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (!error) setTransactions(data);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*");
    if (!error) setClients(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
  };
  const handleAddClient = async () => {
    const { data, error } = await supabase
      .from("clients")
      .insert([clientForm])
      .select();
    if (!error) {
      setClients([...clients, ...data]);
      setClientForm({ name: "", phone: "" });
      toast.success("Cliente agregado exitosamente.");
    }
  };

  const handleAddProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .insert([{ ...productForm, price: parseFloat(productForm.price) }])
      .select();
    if (!error) {
      setProducts([...products, ...data]);
      setProductForm({ name: "", price: "" });
      toast.success("Producto agregado exitosamente.");
    }
  };

  const handleProductSelection = (productId, quantity) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productId === productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === productId ? { ...p, quantity } : p,
        );
      } else {
        return [...prev, { productId, quantity }];
      }
    });
  };

  const createTransaction = async () => {
    if (!selectedClient || selectedProducts.length === 0) return;
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({ client_id: selectedClient })
      .select()
      .single();

    if (txError) return;

    const entries = selectedProducts.map((p) => ({
      transaction_id: tx.id,
      product_id: p.productId,
      quantity: parseInt(p.quantity),
    }));

    await supabase.from("transaction_products").insert(entries);

    // reset
    setSelectedClient(null);
    setSelectedProducts([]);

    toast.success("Transacción creada exitosamente.");
  };

  return (
    <div className="h-screen gap-6 space-y-6 overflow-scroll p-6 pb-20">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">Add Client</h2>
            <Label>Name</Label>
            <Input
              value={clientForm.name}
              onChange={(e) =>
                setClientForm({ ...clientForm, name: e.target.value })
              }
            />
            <Label>Phone</Label>
            <Input
              value={clientForm.phone}
              onChange={(e) =>
                setClientForm({ ...clientForm, phone: e.target.value })
              }
            />
            <Button onClick={handleAddClient}>Add Client</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">Add Product</h2>
            <Label>Name</Label>
            <Input
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
            />
            <Label>Price</Label>
            <Input
              type="number"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
            />
            <Button onClick={handleAddProduct}>Add Product</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="md:col-span-2">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Create Transaction</h2>
          <Label>Client</Label>
          <Select
            onValueChange={setSelectedClient}
            value={selectedClient || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={createTransaction}>Submit Transaction</Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">All Transactions</h2>
          {transactions.map((tx) => {
            // Calculate total for this transaction
            const total = tx.transaction_products.reduce((sum, tp) => {
              return sum + tp.quantity * tp.products.price;
            }, 0);

            return (
              <div key={tx.id} className="space-y-5 rounded-md border p-4">
                <div className="flex justify-between font-semibold">
                  <div className="flex items-center gap-3">
                    {" "}
                    {tx.clients?.name} ({tx.clients?.phone})
                  </div>
                  <div>
                    {new Date(tx.created_at).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <ul className="list-disc pl-4 text-sm">
                  {tx.transaction_products.map((tp, i) => (
                    <li key={i}>
                      {tp.products.name} x{tp.quantity} @ ${tp.products.price} =
                      ${tp.quantity * tp.products.price}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-lg font-semibold">
                  Total: ${total.toFixed(2)}
                </div>
                <div className="flex justify-between">
                  <div className="mt-2 text-lg font-semibold">
                    Quantity:{" "}
                    {tx.transaction_products.reduce(
                      (sum, tp) => sum + tp.quantity,
                      0,
                    )}
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    Servicio:{" "}
                    {(
                      tx.transaction_products.reduce(
                        (sum, tp) => sum + tp.quantity,
                        0,
                      ) * 25
                    ).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        {products.map((p, i) => (
          <Card
            key={i}
            className="flex flex-col items-center justify-between rounded-2xl p-4 text-center shadow-md"
          >
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full rounded-lg object-contain"
            />
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{p.name}</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              <div className="mb-1 text-base font-medium text-black">
                {p.price.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })}
              </div>
              {p.category && (
                <div className="text-xs text-gray-500">
                  Category: {p.category}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/*

 <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <span className="w-1/3">
                  {p.name} (${p.price})
                </span>
                <Input
                  type="number"
                  placeholder="Quantity"
                  onChange={(e) => handleProductSelection(p.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          */
