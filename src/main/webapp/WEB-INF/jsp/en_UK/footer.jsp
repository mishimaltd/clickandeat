<%@ page language="java" %>
<%@ page contentType="text/html; charset=utf-8" %>
<%@ include file="/WEB-INF/jsp/taglibs.jsp" %>

<div id="footer">
    <div class="footer-wrapper">
        <table width="1020" class="footer-table">
            <tr valign="top">
                <td width="470" style="padding-left:10px">
                    <div class="company-details">
                        <div class="footer-h1">Simply the easiest way to order takeaway food online</div>
                        <p>Lorem ipsum dolor sit amet, consectetur <span class="bolder">take away</span> adipisicing <span class="bolder">collection</span>
                        elit, sed do eiusmod tempor <span class="bolder">Madrid</span> ut labore et <span class="bolder">Barcelona</span> magna aliqua.Ut
                        enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                        in reprehenderit in voluptate.</p>
                        <div class="footer-h1 spacer">Italian, Chinese takeaway, Pizza delivery</div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                        in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                        sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        <div class="credit-cards">
                            <div class="credit-card visa"></div>
                            <div class="credit-card mastercard"></div>
                            <div class="credit-card maestro"></div>
                            <div class="credit-card amex"></div>
                        </div>
                        <div class="copyright">
                            &copy;2012 llamarycomer | registered address of company
                        </div>
                    </div>
                </td>
                <td width="200">
                    <div class="company-details">
                        <h2 class="footer">About Us</h2>
                        <div class="footer-list">
                            <p><a class="direct">Help/FAQ</a></p>
                            <p><a class="direct" href="${ctx}/legal.html">Terms &amp; conditions</a></p>
                            <p><a class="direct">Restaurant owners</a></p>
                            <p><a class="direct">Magazine</a></p>
                        </div>
                        <h2 class="footer spacer">Contact Us</h2>
                        <div class="footer-list">
                            <p>120 Street Name<br>Barcelona 08009<br>91 665 432</p>
                            <p><a class="icon-email direct" href="mailto:contact@llamarYcomer.com">contact@llamarycomer.com</a></p>
                        </div>
                    </div>
                </td>
                <td width="250" style="padding-right:10px">
                    <h2 class="footer">Locations</h2>
                    <c:forEach var="location" items="${locations}">
                        <p class="locationlink"><a class="direct" href="${ctx}/app/takeaway-online-${location.first}/loc/${location.first}">${location.second} takeaway online</a></p>
                    </c:forEach>
                </td>
            </tr>
        </table>
    </div>
</div>

<div style="display:none">
    <c:forEach var="entry" items="${cuisineLocationsFull}">
        <div>
            <a href="${ctx}/app/${entry.key.second}/loc/${entry.key.first}">${entry.key.second}</a>
        </div>
        <c:forEach var="list" items="${entry.value}">
            <div><a href="${ctx}/app/${entry.key.second}-${list.second}/csn/${list.first}/${entry.key.first}">${list.second} a domicilio</a></div>
        </c:forEach>
    </c:forEach>
</div>
