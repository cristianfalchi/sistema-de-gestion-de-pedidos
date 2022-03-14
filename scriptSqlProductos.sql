SELECT * FROM discv.productos;
select producto, pro_nom, max(precio) as precio from pedidosremotos group by producto order by producto limit 0 , 99999
delete from productos where producto is null
