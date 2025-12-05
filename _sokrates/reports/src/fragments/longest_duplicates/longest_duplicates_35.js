server/controllers/cartController.js [139:147]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const { error: delErr } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (delErr) throw delErr;

    return res.status(204).send();
  } catch (err) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



server/controllers/cartController.js [189:196]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const { error: delErr } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    if (delErr) throw delErr;

    return res.status(204).send();
  } catch (err) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



