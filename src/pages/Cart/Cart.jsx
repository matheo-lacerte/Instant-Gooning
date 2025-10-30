import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [cartId, setCartId] = useState(null);
		const [items, setItems] = useState([]); // [{id, quantity, unit_price_cents, currency, game:{id,title,cover_url,price,discounted_price}}]
		const [pending, setPending] = useState(new Set()); // itemIds being updated

	const token = useMemo(() => localStorage.getItem("token"), []);

	const authFetch = async (url, options = {}) => {
		const headers = {
			...(options.headers || {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.body && !options.headers?.["Content-Type"] ? { "Content-Type": "application/json" } : {}),
		};
		const res = await fetch(url, { credentials: "include", ...options, headers });
		return res;
	};

		const loadCart = async (opts = {}) => {
			const silent = !!opts.silent;
			try {
				if (!silent) setLoading(true);
				setError("");
				const res = await authFetch("http://localhost:5174/api/payments/cart");
			if (res.status === 401) {
				navigate("/login");
				return;
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			setCartId(data.cart_id);
			setItems(Array.isArray(data.items) ? data.items : []);
		} catch (e) {
			setError(e.message || "Erreur");
		} finally {
				if (!silent) setLoading(false);
		}
	};

	useEffect(() => { loadCart(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

		const inc = async (gameId) => {
			// optimistic update
			const idx = items.findIndex((it) => it.game?.id === gameId);
			if (idx !== -1) {
				const itemId = items[idx].id;
				setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
				setPending((p) => new Set(p).add(itemId));
				try {
					await authFetch("http://localhost:5174/api/payments/cart/items", { method: "POST", body: JSON.stringify({ game_id: gameId, quantity: 1 }) });
				} catch {
					// revert on failure
					setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it));
						} finally {
					setPending((p) => { const np = new Set(p); np.delete(itemId); return np; });
							// background refresh to ensure totals are exact, without global loader
							loadCart({ silent: true });
				}
			}
		};

		const dec = async (itemId) => {
			const idx = items.findIndex((it) => it.id === itemId);
			if (idx !== -1) {
				const current = items[idx];
				const newQty = current.quantity - 1;
				setPending((p) => new Set(p).add(itemId));
				// optimistic
				setItems((prev) => newQty > 0 ? prev.map((it, i) => i === idx ? { ...it, quantity: newQty } : it) : prev.filter((it) => it.id !== itemId));
				try {
					await authFetch(`http://localhost:5174/api/payments/cart/items/${itemId}`, { method: "PATCH" });
				} catch {
					// revert
					setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: current.quantity } : it));
						} finally {
					setPending((p) => { const np = new Set(p); np.delete(itemId); return np; });
							loadCart({ silent: true });
				}
			}
		};

		const remove = async (itemId) => {
			setPending((p) => new Set(p).add(itemId));
			// optimistic remove
			const prevItems = items;
			setItems((prev) => prev.filter((it) => it.id !== itemId));
			try {
				await authFetch(`http://localhost:5174/api/payments/cart/items/${itemId}`, { method: "DELETE" });
			} catch {
				// revert
				setItems(prevItems);
				} finally {
				setPending((p) => { const np = new Set(p); np.delete(itemId); return np; });
					loadCart({ silent: true });
			}
		};

	const checkout = async () => {
		try {
			if (!cartId) return;
			// Save titles locally as a fallback for success page
			try {
				const titles = items.map((it) => it.game?.title).filter(Boolean);
				localStorage.setItem("last_cart_titles", JSON.stringify(titles));
			} catch {}
			const res = await authFetch("http://localhost:5174/api/payments/cart/checkout", { method: "POST", body: JSON.stringify({ cart_id: cartId }) });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (data?.url) window.location.assign(data.url);
		} catch (e) {
			setError(e.message || "Erreur paiement");
		}
	};

		const clearCart = async () => {
			try {
				setLoading(true);
				setError("");
				await authFetch("http://localhost:5174/api/payments/cart/clear", { method: "DELETE" });
				setItems([]);
				try { localStorage.removeItem("last_cart_titles"); } catch {}
			} catch (e) {
				setError(e.message || "Erreur");
			} finally {
				setLoading(false);
			}
		};

	const money = (cents, currency = "CAD") => {
		const val = (Number(cents || 0) / 100).toFixed(2);
		return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(val);
	};

	const totalCents = items.reduce((acc, it) => acc + (it.quantity * (it.unit_price_cents || 0)), 0);
	const currency = items[0]?.currency || "CAD";

	return (
		<div className="cart-page">
			<div className="cart-card">
				<h1>Votre panier</h1>
				{error && <p className="error">{error}</p>}
				{loading ? (
					<p>Chargement…</p>
				) : items.length === 0 ? (
					<div className="empty">
						<p>Votre panier est vide.</p>
						<Link className="btn" to="/">Continuer vos achats</Link>
					</div>
				) : (
					<>
						<ul className="cart-list">
											{items.map((it) => (
												<li key={it.id} className={`cart-row${pending.has(it.id) ? " is-pending" : ""}`}>
									<div className="left">
										{it.game?.cover_url ? <img src={it.game.cover_url} alt="cover" className="cover" /> : <div className="cover ph" />}
										<div className="meta">
											<div className="title">{it.game?.title || "Jeu"}</div>
															<div className="price">{money(it.unit_price_cents, it.currency)}</div>
															<div className="subtotal">Sous-total: <strong>{money((it.unit_price_cents || 0) * (it.quantity || 0), it.currency)}</strong></div>
										</div>
									</div>
									<div className="right">
										<div className="qty">
															<button disabled={pending.has(it.id)} className="btn sm" onClick={() => dec(it.id)} aria-label="Diminuer">−</button>
											<span className="q">{it.quantity}</span>
															<button disabled={pending.has(it.id)} className="btn sm" onClick={() => inc(it.game?.id)} aria-label="Augmenter">+</button>
										</div>
										<div className="row-actions">
															<button disabled={pending.has(it.id)} className="btn text" onClick={() => remove(it.id)}>Retirer</button>
										</div>
									</div>
								</li>
							))}
						</ul>

						<div className="summary">
							<div className="line">
								<span>Total</span>
								<strong>{money(totalCents, currency)}</strong>
							</div>
											<div className="actions">
												<button className="btn" onClick={clearCart}>Vider le panier</button>
												<button className="btn primary" onClick={checkout}>Payer</button>
												<Link className="btn" to="/">Continuer vos achats</Link>
											</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

