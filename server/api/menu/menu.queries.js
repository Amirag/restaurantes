/*eslint-env node*/

import {
  User,
  MenuNodes,
  Restaurante,
  Categoria,
  Platillo,
  MenuPaths,
  MenuLikes,
  MenuAdmin,
  Ciudad,
  Estado
} from '../../sqldb';

export const readAdminQuery =
`SELECT t1.userId, t1.restauranteId, t2.email
  FROM \`${MenuAdmin.tableName}\` t1
  LEFT JOIN \`${User.tableName}\` t2 ON t1.userId = t2._id;`;

export const indexQuery =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    WHERE t2.active = 1
    ORDER BY t1.visitas ASC) x,
(SELECT @row := 0) y;`;

export const searchQuery =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    WHERE t2.active = 1 AND
      MATCH(t1.name, t1.description, t1.keywords) AGAINST
      (:term IN NATURAL LANGUAGE MODE)
    ORDER BY t1.visitas ASC) x,
(SELECT @row := 0) y;`;

export const indexLikeQuery =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT
		t2._id, t2.description, t2.image, t2.likes, t2.postalCode,
      t2.telephone1, t2.telephone2, t2.visitas,
      t2.address1, t2.address2,
      t2.cityId, t2.keywords,
      t2.horarioLunesApertura, t2.horarioLunesCierre,
      t2.horarioMartesApertura, t2.horarioMartesCierre,
      t2.horarioMiercolesApertura, t2.horarioMiercolesCierre,
      t2.horarioJuevesApertura, t2.horarioJuevesCierre,
      t2.horarioViernesApertura, t2.horarioViernesCierre,
      t2.horarioSabadoApertura, t2.horarioSabadoCierre,
      t2.horarioDomingoApertura, t2.horarioDomingoCierre,
      t2.servicioDomicilio,
      t2.name,
      t4.name AS city, t4.stateId,
      t5.name AS state
    FROM \`${MenuLikes.tableName}\` t1
    LEFT JOIN \`${Restaurante.tableName}\` t2 ON t2._id = t1.restauranteId
    LEFT JOIN \`${MenuNodes.tableName}\` t3 ON t3._id = t2._id
    LEFT JOIN \`${Ciudad.tableName}\` t4 ON t4._id = t2.cityId
    LEFT JOIN \`${Estado.tableName}\` t5 ON t5._id = t4.stateId
    WHERE t3.active = 1 AND t1.userId = :userId
    ORDER BY t2.name ASC) x,
(SELECT @row := 0) y;`;

export const indexQueryAdmin =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name, t2.active,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    ORDER BY t1.name) x,
(SELECT @row := 0) y;`;

export const searchQueryAdmin =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name, t2.active,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    WHERE MATCH(t1.name, t1.description, t1.keywords) AGAINST
    (:term IN NATURAL LANGUAGE MODE)
    ORDER BY t1.name) x,
(SELECT @row := 0) y;`;

export const highlightQuery =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    WHERE t2.active = 1
    ORDER BY t1.visitas DESC
    LIMIT :limit) x,
  (SELECT @row := 0) y;`;

export const highlightQueryAdmin =
`SELECT @row := @row + 1 AS row, x.*
  FROM (SELECT t1._id, t1.description, t1.image, t1.likes, t1.postalCode,
      t1.telephone1, t1.telephone2, t1.visitas,
      t1.address1, t1.address2,
      t1.cityId, t1.keywords,
      t1.horarioLunesApertura, t1.horarioLunesCierre,
      t1.horarioMartesApertura, t1.horarioMartesCierre,
      t1.horarioMiercolesApertura, t1.horarioMiercolesCierre,
      t1.horarioJuevesApertura, t1.horarioJuevesCierre,
      t1.horarioViernesApertura, t1.horarioViernesCierre,
      t1.horarioSabadoApertura, t1.horarioSabadoCierre,
      t1.horarioDomingoApertura, t1.horarioDomingoCierre,
      t1.servicioDomicilio,
      t1.name, t2.active,
      t3.name AS city, t3.stateId,
      t4.name AS state
    FROM \`${Restaurante.tableName}\` t1
    LEFT JOIN \`${MenuNodes.tableName}\` t2 ON t2._id = t1._id
    LEFT JOIN \`${Ciudad.tableName}\` t3 ON t3._id = t1.cityId
    LEFT JOIN \`${Estado.tableName}\` t4 ON t4._id = t3.stateId
    ORDER BY t1.visitas DESC
    LIMIT :limit) x,
  (SELECT @row := 0) y;`;

export const addLeafQuery =
`INSERT INTO \`${MenuPaths.tableName}\` (parent, descendant, depth)
  SELECT t.parent, :newNodeId, t.depth + 1
    FROM \`${MenuPaths.tableName}\` t
    WHERE t.descendant = :parentId
  UNION ALL
    SELECT :newNodeId, :newNodeId, 0;`;

export const deleteLeafAndDescendantsQuery =
`DELETE t1
FROM \`${MenuNodes.tableName}\` t1
JOIN \`${MenuPaths.tableName}\` t2 ON t2.descendant = t1._id
WHERE t2.parent = :deletedNodeId;`;

/*
export const removeLeafAndDescendantsQuery =
`DELETE FROM \`${MenuNodes.tableName}\`
  WHERE _id IN (
    SELECT descendant
    FROM \`${MenuPaths.tableName}\`
    WHERE parent = :deletedNodeId
  );
DELETE FROM \`${MenuPaths.tableName}\`
  WHERE descendant IN (
    SELECT descendant
    FROM \`${MenuPaths.tableName}\`
    WHERE parent = :deletedNodeId
  );`;
*/

export const disconnectSubtreeQuery =
`DELETE t1.* FROM \`${MenuPaths.tableName}\` t1
JOIN \`${MenuPaths.tableName}\` t2 ON t1.descendant = t2.descendant
JOIN \`${MenuPaths.tableName}\` t3 ON t1.parent = t3.parent
WHERE t2.parent = :movedNodeId AND
  t3.descendant = :movedNodeId AND
  t3.parent != t3.descendant;`;
/*
export const disconnectSubtreeQuery =
`DELETE t.* FROM \`${MenuPaths.tableName}\` t
  WHERE descendant IN (
  	SELECT descendant FROM (
  		SELECT descendant
  		FROM \`${MenuPaths.tableName}\`
  		WHERE parent = :movedNode
      ) x
  ) AND parent IN (
  	SELECT parent FROM (SELECT parent
  		FROM \`${MenuPaths.tableName}\`
  		WHERE descendant = :movedNode AND
  		parent != descendant
  	) y
  );`;
*/
export const connectSubtreeQuery =
`INSERT INTO \`${MenuPaths.tableName}\` (parent, descendant, depth)
  SELECT supertree.parent,
    subtree.descendant,
    IF(supertree.depth > subtree.depth,
      supertree.depth + 1,
      subtree.depth + 1) AS depth
  FROM \`${MenuPaths.tableName}\` supertree
  CROSS JOIN \`${MenuPaths.tableName}\` AS subtree
  WHERE supertree.descendant = :parentNodeId
  AND subtree.parent = :movedNodeId;`;

export const nodeCountQuery =
`SELECT COUNT(*) AS count
FROM \`${MenuPaths.tableName}\`
WHERE parent = :parentNodeId AND depth = :depth`;
/*
export const getDescendantsBreadcrumbsQuery =
`SELECT d._id,
  CONCAT(REPEAT('-', p.depth), d.name) AS hier,
	p.depth, p.parent, p.descendant,
  t1.position AS positionCategorias,
  t2.position AS positionPlatillos, t2.description, t2.price,
  GROUP_CONCAT(crumbs.parent SEPARATOR '/') AS breadcrumbs
FROM \`${MenuNodes.tableName}\` AS d
JOIN \`${MenuPaths.tableName}\` AS p ON d._id = p.descendant
JOIN \`${MenuPaths.tableName}\` AS crumbs ON crumbs.descendant = p.descendant
LEFT JOIN \`${Categoria.tableName}\` AS t1 ON d._id = t1._id
LEFT JOIN \`${Platillo.tableName}\` AS t2 ON d._id = t2._id
WHERE p.parent = :nodeId
GROUP BY d._id
ORDER BY breadcrumbs;`;
*/

export const getDescendantsBreadcrumbsQuery =
`SELECT d._id, d.tipo,
  (CASE d.tipo
    WHEN 'categoria' THEN t1.name
    WHEN 'platillo' THEN t2.name
    WHEN 'restaurante' THEN t3.name
    ELSE NULL
  END) AS name,
  t1.position AS positionCategorias,
  t2.position AS positionPlatillos, t2.description AS descripcionPlatillo,
  t2.price, t2.image as imagenPlatillo,
  t3.description,
  t3.horarioLunesApertura, t3.horarioLunesCierre,
  t3.horarioMartesApertura, t3.horarioMartesCierre,
  t3.horarioMiercolesApertura, t3.horarioMiercolesCierre,
  t3.horarioJuevesApertura, t3.horarioJuevesCierre,
  t3.horarioViernesApertura, t3.horarioViernesCierre,
  t3.horarioSabadoApertura, t3.horarioSabadoCierre,
  t3.horarioDomingoApertura, t3.horarioDomingoCierre,
  t3.servicioDomicilio,
  t3.image, t3.likes, t3.postalCode, t3.telephone1, t3.telephone2, t3.visitas,
  t3.address1, t3.address2,
  t3.cityId, t3.keywords,
  t4.name AS city, t4.stateId, t5.name AS state,
  GROUP_CONCAT(crumbs.parent SEPARATOR '/') AS breadcrumbs
FROM \`${MenuNodes.tableName}\` AS d
JOIN \`${MenuPaths.tableName}\` AS p ON d._id = p.descendant
JOIN \`${MenuPaths.tableName}\` AS crumbs ON crumbs.descendant = p.descendant
LEFT JOIN \`${Categoria.tableName}\` AS t1 ON d._id = t1._id
LEFT JOIN \`${Platillo.tableName}\` AS t2 ON d._id = t2._id
LEFT JOIN \`${Restaurante.tableName}\` AS t3 ON d._id = t3._id
LEFT JOIN \`${Ciudad.tableName}\` t4 ON t4._id = t3.cityId
LEFT JOIN \`${Estado.tableName}\` t5 ON t5._id = t4.stateId
WHERE p.parent = :nodeId AND d.active = 1
GROUP BY d._id
ORDER BY breadcrumbs;`;

export const getDescendantsBreadcrumbsQueryAdmin =
`SELECT d._id, d.tipo,
  (CASE d.tipo
    WHEN 'categoria' THEN t1.name
    WHEN 'platillo' THEN t2.name
    WHEN 'restaurante' THEN t3.name
    ELSE NULL
  END) AS name, d.active,
  t1.position AS positionCategorias,
  t2.position AS positionPlatillos, t2.description AS descripcionPlatillo,
  t2.price, t2.image as imagenPlatillo,
  t3.description,
  t3.horarioLunesApertura, t3.horarioLunesCierre,
  t3.horarioMartesApertura, t3.horarioMartesCierre,
  t3.horarioMiercolesApertura, t3.horarioMiercolesCierre,
  t3.horarioJuevesApertura, t3.horarioJuevesCierre,
  t3.horarioViernesApertura, t3.horarioViernesCierre,
  t3.horarioSabadoApertura, t3.horarioSabadoCierre,
  t3.horarioDomingoApertura, t3.horarioDomingoCierre,
  t3.servicioDomicilio,
  t3.image, t3.likes, t3.postalCode, t3.telephone1, t3.telephone2, t3.visitas,
  t3.address1, t3.address2,
  t3.cityId, t3.keywords,
  t4.name AS city, t4.stateId, t5.name AS state,
  GROUP_CONCAT(crumbs.parent SEPARATOR '/') AS breadcrumbs
FROM \`${MenuNodes.tableName}\` AS d
JOIN \`${MenuPaths.tableName}\` AS p ON d._id = p.descendant
JOIN \`${MenuPaths.tableName}\` AS crumbs ON crumbs.descendant = p.descendant
LEFT JOIN \`${Categoria.tableName}\` AS t1 ON d._id = t1._id
LEFT JOIN \`${Platillo.tableName}\` AS t2 ON d._id = t2._id
LEFT JOIN \`${Restaurante.tableName}\` AS t3 ON d._id = t3._id
LEFT JOIN \`${Ciudad.tableName}\` t4 ON t4._id = t3.cityId
LEFT JOIN \`${Estado.tableName}\` t5 ON t5._id = t4.stateId
WHERE p.parent = :nodeId
GROUP BY d._id
ORDER BY breadcrumbs;`;

export function updatePositionDeleteNodeQuery(tableToUpdate) {
  return `UPDATE \`${tableToUpdate}\` t1
  INNER JOIN \`${MenuPaths.tableName}\` t2 ON t1._id = t2.descendant
  SET t1.position = t1.position - 1
  WHERE t2.parent = :parentNodeId
    AND t2.depth = :depth
    AND t1.position > :deletedNodePosition;`;
}

export function increasePositionNodeQuery(tableToUpdate) {
  return `UPDATE \`${tableToUpdate}\` t1
  INNER JOIN \`${MenuPaths.tableName}\` t2 ON t1._id = t2.descendant
  SET t1.position = t1.position - 1
  WHERE t2.parent = :parentNodeId
  	AND depth = :depth
  	AND position = :nodePosition + 1;
  UPDATE \`${tableToUpdate}\` SET position = position + 1
  WHERE _id = :nodeId;`;
}

export function decreasePositionNodeQuery(tableToUpdate) {
  return `UPDATE \`${tableToUpdate}\` t1
  INNER JOIN \`${MenuPaths.tableName}\` t2 ON t1._id = t2.descendant
  SET t1.position = t1.position + 1
  WHERE t2.parent = :parentNodeId
  	AND depth = :depth
  	AND position = :nodePosition - 1;
  UPDATE \`${tableToUpdate}\` SET position = position - 1
  WHERE _id = :nodeId;`;
}

export function getNodesPositionQuery(tableToCheck) {
  return `SELECT t1._id, t1.position
  FROM \`${tableToCheck}\` t1
  INNER JOIN \`${MenuPaths.tableName}\` t2 ON t1._id = t2.descendant
  WHERE t2.parent = :parentNodeId AND depth = :depth;`;
}
