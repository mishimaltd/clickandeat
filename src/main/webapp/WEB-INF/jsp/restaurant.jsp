<%@ page language="java" %>
<%@ include file="/WEB-INF/jsp/taglibs.jsp" %>

<head>
    <title>${restaurant.name}</title>
    <script type="text/javascript" src="${resources}/script/tools.js"></script>
    <script type="text/javascript" src="${resources}/script/restaurant.js"></script>
    <script type="text/javascript" src="${resources}/script/orders.js"></script>
</head>

<body>

<script type="text/javascript">
    var searchLocation="${search.location}";
</script>

<div id="maincontent">
    <%@ include file="/WEB-INF/jsp/workflow.jsp" %>
    <div id="contentbody">

        <div id="restaurant">${restaurant.name}</div>
        <div>${restaurant.description}</div>

        <div class="menu">
            <c:forEach var="menuCategory" items="${restaurant.menu.menuCategories}">
                <div class="menucategory">
                    <div class="menucategoryheader">
                        <div class="menucategoryname">${menuCategory.name}</div>
                        <div class="menucategorysummary">${menuCategory.summary}</div>
                    </div>
                    <div class="menuitems">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="menuItemTable">
                            <c:choose>
                                <c:when test="${menuCategory.type == 'STANDARD'}">
                                    <c:forEach var="menuItem" items="${menuCategory.menuItems}">
                                        <tr valign="top">
                                            <td width="80%">
                                                <div class="menuItemDetails">
                                                    <div class="menuItemNumber">${menuItem.number}</div>
                                                    <div class="menuItemTitle">${menuItem.title} <div class="menuItemSubtitle">${menuItem.subtitle}</div></div>
                                                    <div class="menuItemDescription">${menuItem.description}</div>
                                                </div>
                                            </td>
                                            <td width="20%" align="right">
                                                <div class="menuItemActions">
                                                    <div class="menuItemCost"><spring:message code="label.currency"/>${menuItem.formattedCost}</div>
                                                    <div class="menuItemAction">
                                                        <select class="menuItemQuantity" id="select_${menuItem.itemId}">
                                                            <option value="1">1</option>
                                                            <option value="2">2</option>
                                                            <option value="3">3</option>
                                                            <option value="4">4</option>
                                                            <option value="5">5</option>
                                                        </select>
                                                        <a onclick="addMultipleToOrder('${restaurant.restaurantId}','${menuItem.itemId}',null,${menuItem.additionalItemChoiceArray},${menuItem.nullSafeChoiceLimit},${menuItem.nullSafeAdditionalItemCost})">
                                                            <img title="<spring:message code="label.add-to-order"/>" src="${resources}/images/icons-shadowless/plus-button.png"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </c:forEach>
                                </c:when>
                                <c:otherwise>
                                    <thead>
                                        <th width="25%"></th>
                                        <c:forEach var="itemType" items="${menuCategory.itemTypes}">
                                            <th align="center">${itemType}</th>
                                        </c:forEach>
                                    </thead>
                                    <tbody>
                                        <c:forEach var="menuItem" items="${menuCategory.menuItems}">
                                            <tr valign="top">
                                                <td width="25%">
                                                    <div class="menuItemDetails">
                                                        <div class="menuItemNumber">${menuItem.number}</div>
                                                        <div class="menuItemTitle">${menuItem.title} <div class="menuItemSubtitle">${menuItem.subtitle}</div></div>
                                                        <div class="menuItemDescription">${menuItem.description}</div>
                                                    </div>
                                                </td>
                                                <c:forEach var="menuItemTypeCost" items="${menuItem.menuItemTypeCosts}">
                                                    <td align="right">
                                                        <c:if test="${menuItemTypeCost.cost != null}">
                                                            <div class="menuItemActions">
                                                                <div class="menuItemCost"><spring:message code="label.currency"/>${menuItemTypeCost.formattedCost}</div>
                                                                <div class="menuItemAction">
                                                                    <select class="menuItemQuantity" id="select_${menuItem.itemId}_${fn:replace(menuItemTypeCost.type,"'","###")}">
                                                                        <option value="1">1</option>
                                                                        <option value="2">2</option>
                                                                        <option value="3">3</option>
                                                                        <option value="4">4</option>
                                                                        <option value="5">5</option>
                                                                    </select>
                                                                    <a onclick="addMultipleToOrder('${restaurant.restaurantId}','${menuItem.itemId}','${fn:replace(menuItemTypeCost.type,"'","###")}',${menuItem.additionalItemChoiceArray},${menuItem.nullSafeChoiceLimit},${menuItemTypeCost.nullSafeAdditionalItemCost})">
                                                                        <img title="<spring:message code="label.add-to-order"/>" src="${resources}/images/icons-shadowless/plus-button.png"/>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </c:if>
                                                    </td>
                                                </c:forEach>
                                            </tr>
                                        </c:forEach>
                                    </tbody>
                                </c:otherwise>
                            </c:choose>
                        </table>
                    </div>
                </div>
            </c:forEach>
        </div>

        <div>
            <input type="button" id="selectanotherbutton" value="<spring:message code="label.select-another-restaurant"/>"/>
        </div>

    </div>
</div>

<div id="rightbar">
    <%@ include file="/WEB-INF/jsp/order.jsp" %>
</div>

</body>
</html>
