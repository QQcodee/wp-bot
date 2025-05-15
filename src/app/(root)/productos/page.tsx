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
import { set } from "date-fns";
import { Combobox } from "@/components/SelectConSearch";
import { Search, ShoppingCart } from "lucide-react";
import { Carrito } from "@/components/Carrito";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const page = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clientForm, setClientForm] = useState({ name: "", phone: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "" });
  const [transactions, setTransactions] = useState([]);

  const [categories, setCategories] = useState([]);
  console.log(categories);

  useEffect(() => {
    fetchClients();
    //fetchProducts();
    fetchTransactions(); // Fetch the initial list of transactions
    fetchCategories();

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

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("category", { count: "exact", head: false })
      .neq("category", null)
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // Extract unique categories from the result
    const uniqueCategories = [...new Set(data.map((item) => item.category))];
    setCategories(uniqueCategories);
  };

  const fetchProductsByCategory = async (category) => {
    let query = supabase.from("products").select("*");

    if (category.toLowerCase() !== "todas") {
      query = query.eq("category", category);
    }

    if (!category) {
      query = supabase.from("products").select("*");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching filtered products:", error);
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

  const createTransaction = async (clientId, selectedProducts) => {
    if (!clientId || selectedProducts.length === 0) return;

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({ client_id: clientId })
      .select()
      .single();

    if (txError) {
      console.error("Transaction error:", txError);
      return;
    }

    const entries = selectedProducts.map((p) => ({
      transaction_id: tx.id,
      product_id: p.productId,
      quantity: parseInt(p.quantity),
    }));

    const { error: entryError } = await supabase
      .from("transaction_products")
      .insert(entries);

    if (entryError) {
      console.error("Transaction entries error:", entryError);
      return;
    }

    // Reset UI

    setSelectedProducts([]);
    toast.success("Tu pedido se ha realizado con éxito.");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }, 600); // delay in ms

    return () => clearTimeout(delayDebounce); // cancel previous timeout if still typing
  }, [searchTerm, products]);

  const [cart, setCart] = useState([]);

  return (
    <>
      <div className="sticky top-0 flex w-full flex-col gap-2 bg-white p-6">
        <div className="flex w-full items-center justify-center">
          <img src="https://eseivxrgtjprkfbhxxrf.supabase.co/storage/v1/object/public/logos//COSTCO%202.png" />
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold leading-tight tracking-tighter">
            Productos (
            {searchTerm.length > 0 ? filteredProducts.length : products.length})
          </h1>

          <Carrito
            cartItems={cart}
            onUpdateCart={setCart}
            createTransaction={createTransaction}
          />
        </div>
        <Combobox
          categories={["Todas", ...categories]}
          onChange={(selectedCategory) => {
            fetchProductsByCategory(selectedCategory);
          }}
        />
        <div className="relative mt-4 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar..."
            className="h-10 rounded-md border border-input bg-background pl-10 shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="h-screen gap-6 space-y-6 overflow-scroll p-6 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          {searchTerm.length > 0 ? (
            <>
              {filteredProducts.map((p, i) => (
                <Card
                  key={i}
                  className="flex flex-col items-center justify-between rounded-2xl p-4 text-center shadow-md"
                >
                  <PhotoProvider>
                    <PhotoView src={p.image_url}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-2/3 cursor-zoom-in rounded-lg object-contain"
                      />
                    </PhotoView>
                  </PhotoProvider>

                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {p.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm text-muted-foreground">
                    <div className="mb-1 text-[21px] text-base font-medium text-black">
                      {p.price.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })}
                    </div>

                    {p.category && (
                      <div className="text-xs text-gray-500">
                        Categoría: {p.category}
                      </div>
                    )}

                    {cart.find((item) => item.id === p.id) ? (
                      <div className="mt-3 flex w-full flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCart((prevCart) =>
                                prevCart
                                  .map((item) =>
                                    item.id === p.id
                                      ? { ...item, quantity: item.quantity - 1 }
                                      : item,
                                  )
                                  .filter((item) => item.quantity > 0),
                              )
                            }
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium">
                            {cart.find((item) => item.id === p.id)?.quantity} en
                            carrito
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCart((prevCart) =>
                                prevCart.map((item) =>
                                  item.id === p.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item,
                                ),
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() =>
                            setCart((prevCart) =>
                              prevCart.filter((item) => item.id !== p.id),
                            )
                          }
                        >
                          Remover del carrito
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="mt-3 w-full"
                        onClick={() =>
                          setCart((prevCart) => [
                            ...prevCart,
                            { ...p, quantity: 1 },
                          ])
                        }
                      >
                        Agregar al carrito
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {products.map((p, i) => (
                <Card
                  key={i}
                  className="flex flex-col items-center justify-between rounded-2xl p-4 text-center shadow-md"
                >
                  <PhotoProvider>
                    <PhotoView src={p.image_url}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-2/3 cursor-zoom-in rounded-lg object-contain"
                      />
                    </PhotoView>
                  </PhotoProvider>

                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {p.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm text-muted-foreground">
                    <div className="mb-1 text-[21px] text-base font-medium text-black">
                      {p.price.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })}
                    </div>

                    {p.category && (
                      <div className="text-xs text-gray-500">
                        Categoría: {p.category}
                      </div>
                    )}

                    {cart.find((item) => item.id === p.id) ? (
                      <div className="mt-3 flex w-full flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCart((prevCart) =>
                                prevCart
                                  .map((item) =>
                                    item.id === p.id
                                      ? { ...item, quantity: item.quantity - 1 }
                                      : item,
                                  )
                                  .filter((item) => item.quantity > 0),
                              )
                            }
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium">
                            {cart.find((item) => item.id === p.id)?.quantity} en
                            carrito
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCart((prevCart) =>
                                prevCart.map((item) =>
                                  item.id === p.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item,
                                ),
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() =>
                            setCart((prevCart) =>
                              prevCart.filter((item) => item.id !== p.id),
                            )
                          }
                        >
                          Remover del carrito
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="mt-3 w-full"
                        onClick={() =>
                          setCart((prevCart) => [
                            ...prevCart,
                            { ...p, quantity: 1 },
                          ])
                        }
                      >
                        Agregar al carrito
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
