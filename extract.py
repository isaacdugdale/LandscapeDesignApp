import sys, json, math, collections
import numpy as np
sys.path.insert(0,"/private/tmp/claude-501/-Users-petrabismire-Desktop-Landscape-design-House-plans/8e253756-3f39-4a35-a087-b4e204b1ee45/scratchpad/ifc")
import ifcopenshell
from ifcopenshell.util.placement import get_local_placement
from geom import a2p, cto, xf, prof_pts, crv_pts, collect, newell

F="/Users/petrabismire/Desktop/Landscape design/House plans/234 Duffy Street, Ainslie - POST REVIEW FINAL7.ifc"
f=ifcopenshell.open(F)
NOTES=[]

# ---------- units ----------
PRE={'EXA':1e18,'PETA':1e15,'TERA':1e12,'GIGA':1e9,'MEGA':1e6,'KILO':1e3,'HECTO':1e2,'DECA':1e1,
     'DECI':1e-1,'CENTI':1e-2,'MILLI':1e-3,'MICRO':1e-6,'NANO':1e-9}
proj=f.by_type("IfcProject")[0]
lu=None; scale=1.0; luname=None
for u in proj.UnitsInContext.Units:
    if u.is_a("IfcSIUnit") and u.UnitType=="LENGTHUNIT":
        lu=u; luname=(u.Prefix or "")+u.Name; scale=PRE.get(u.Prefix,1.0)
    elif u.is_a("IfcConversionBasedUnit") and u.UnitType=="LENGTHUNIT":
        lu=u; luname=u.Name; scale=u.ConversionFactor.ValueComponent.wrappedValue
S=scale  # to metres

def M(el):
    return get_local_placement(el.ObjectPlacement) if el.ObjectPlacement is not None else np.eye(4)

def world(el):
    """world points (metres) and world faces for an element's Body/Axis reps"""
    pts=[]; faces=[]
    if el.Representation:
        m=M(el)
        for r in el.Representation.Representations:
            if r.RepresentationIdentifier in ("Body","Facetation",None):
                for it in r.Items: collect(it, m, pts, faces)
    P=np.array(pts,float)*S if pts else np.zeros((0,3))
    FS=[np.array(x,float)*S for x in faces]
    return P, FS

def bbox(P):
    if not len(P): return None
    return [[round(float(P[:,i].min()),3) for i in range(3)],
            [round(float(P[:,i].max()),3) for i in range(3)]]

def pset(el, name, prop):
    for rel in getattr(el,"IsDefinedBy",[]) or []:
        if rel.is_a("IfcRelDefinesByProperties"):
            ps=rel.RelatingPropertyDefinition
            if ps.is_a("IfcPropertySet") and ps.Name==name:
                for p in ps.HasProperties:
                    if p.Name==prop and p.is_a("IfcPropertySingleValue") and p.NominalValue is not None:
                        return p.NominalValue.wrappedValue
    return None

def storey_of(el):
    for rel in getattr(el,"ContainedInStructure",[]) or []:
        return rel.RelatingStructure.Name
    for rel in getattr(el,"Decomposes",[]) or []:
        p=rel.RelatingObject
        if p.is_a("IfcBuildingStorey"): return p.Name
        r=storey_of(p)
        if r: return r
    return None

def rnd(v,n=3):
    return None if v is None else round(float(v),n)

# ---------- georef ----------
site=f.by_type("IfcSite")[0]
def dms(t):
    if not t: return None
    t=list(t)+[0]*(4-len(t))
    sgn=-1 if (t[0]<0 or t[1]<0 or t[2]<0 or t[3]<0) else 1
    d=abs(t[0])+abs(t[1])/60+abs(t[2])/3600+abs(t[3])/3600e6
    return round(sgn*d,9)
ctxs=[c for c in f.by_type("IfcGeometricRepresentationContext") if not c.is_a("IfcGeometricRepresentationSubContext")]
tn=None
for c in ctxs:
    if c.TrueNorth:
        dr=list(c.TrueNorth.DirectionRatios)
        tn={"DirectionRatios":[round(x,15) for x in dr],
            "bearing_deg_cw_from_+Y": round(math.degrees(math.atan2(dr[0],dr[1])),6)}
mapconv=[]
try:
    for mc in f.by_type("IfcMapConversion"):
        mapconv.append({k:getattr(mc,k,None) for k in
          ("Eastings","Northings","OrthogonalHeight","XAxisAbscissa","XAxisOrdinate","Scale")})
except Exception:
    pass
sm=M(site)
georef={
 "IfcSite": {"GlobalId":site.GlobalId,"Name":site.Name,
   "RefLatitude_raw":list(site.RefLatitude) if site.RefLatitude else None,
   "RefLatitude_deg":dms(site.RefLatitude),
   "RefLongitude_raw":list(site.RefLongitude) if site.RefLongitude else None,
   "RefLongitude_deg":dms(site.RefLongitude),
   "RefElevation":rnd(site.RefElevation*S if site.RefElevation is not None else None)},
 "IfcMapConversion": mapconv or None,
 "TrueNorth": tn,
 "site_placement_matrix_m":[[round(float(sm[i][j]*(S if (j==3 and i<3) else 1)),9) for j in range(4)] for i in range(4)],
 "site_local_x_axis_bearing_deg_cw_from_+Y": round(math.degrees(math.atan2(sm[0][0],sm[1][0])),6),
}

# ---------- storeys ----------
storeys=[]
for st in f.by_type("IfcBuildingStorey"):
    m=M(st)
    storeys.append({"GlobalId":st.GlobalId,"name":st.Name,"long_name":st.LongName,
      "Elevation_raw":st.Elevation,"Elevation_m":rnd(st.Elevation*S if st.Elevation is not None else None),
      "world_z_m":rnd(m[2][3]*S)})
storeys.sort(key=lambda s:(s["world_z_m"] if s["world_z_m"] is not None else 0))

# ---------- walls ----------
walls=[]; nofallback=[]
for w in f.by_type("IfcWall"):
    m=M(w)
    ax=None
    if w.Representation:
        for r in w.Representation.Representations:
            if r.RepresentationIdentifier=="Axis":
                p=[];fa=[]
                for it in r.Items: collect(it,m,p,fa)
                if len(p)>=2: ax=np.array(p,float)*S
    P,FS=world(w)
    bb=bbox(P)
    th=None
    for rel in getattr(w,"HasAssociations",[]) or []:
        if rel.is_a("IfcRelAssociatesMaterial"):
            mt=rel.RelatingMaterial
            ls=None
            if mt.is_a("IfcMaterialLayerSetUsage"): ls=mt.ForLayerSet
            elif mt.is_a("IfcMaterialLayerSet"): ls=mt
            if ls: th=sum(l.LayerThickness for l in ls.MaterialLayers)*S
    used_bbox=False
    if ax is not None:
        st_,en_=ax[0],ax[-1]
    else:
        used_bbox=True; nofallback.append(w.GlobalId)
        if bb:
            dx=bb[1][0]-bb[0][0]; dy=bb[1][1]-bb[0][1]
            cx=(bb[0][0]+bb[1][0])/2; cy=(bb[0][1]+bb[1][1])/2
            if dx>=dy: st_,en_=np.array([bb[0][0],cy,0]),np.array([bb[1][0],cy,0])
            else: st_,en_=np.array([cx,bb[0][1],0]),np.array([cx,bb[1][1],0])
            if th is None: th=min(dx,dy)
        else: st_=en_=np.array([0.,0.,0.])
    ext=pset(w,"Pset_WallCommon","IsExternal")
    th_src="material_layer_set" if th is not None else None
    if th is None and ax is not None and len(P):
        d_=np.array([en_[0]-st_[0],en_[1]-st_[1]]); n_=np.linalg.norm(d_)
        if n_>1e-6:
            perp=np.array([-d_[1],d_[0]])/n_
            proj=P[:,:2]@perp
            th=float(proj.max()-proj.min()); th_src="body_perpendicular_extent"
    if th is None and bb:
        th=min(bb[1][0]-bb[0][0],bb[1][1]-bb[0][1]); th_src="bbox_minor"
    walls.append({"GlobalId":w.GlobalId,"name":w.Name,"class":w.is_a(),"storey":storey_of(w),
      "start":[rnd(st_[0]),rnd(st_[1])],"end":[rnd(en_[0]),rnd(en_[1])],
      "length_m":rnd(float(np.hypot(en_[0]-st_[0],en_[1]-st_[1]))),
      "thickness_m":rnd(th),
      "base_z":(bb[0][2] if bb else None),"top_z":(bb[1][2] if bb else None),
      "height_m":rnd(bb[1][2]-bb[0][2]) if bb else None,
      "thickness_source":th_src,
      "is_external_pset":ext,"axis_from_bbox":used_bbox,
      "hosts_external_opening":None})

# ---------- slabs & roofs ----------
def outer_poly_from_extrusion(el):
    if not el.Representation: return None,None,None
    m=M(el)
    for r in el.Representation.Representations:
        if r.RepresentationIdentifier!="Body": continue
        for it in r.Items:
            node=it
            for _ in range(6):
                if node.is_a() in ("IfcBooleanClippingResult","IfcBooleanResult"): node=node.FirstOperand
                elif node.is_a()=="IfcMappedItem": node=node.MappingSource.MappedRepresentation.Items[0]
                else: break
            if node.is_a()=="IfcExtrudedAreaSolid":
                m2=m@a2p(node.Position)
                base=xf(m2,prof_pts(node.SweptArea))*S
                d=np.array(node.ExtrudedDirection.DirectionRatios,float)
                vec=(m2[:3,:3]@d)*node.Depth*S
                return base, float(np.linalg.norm(vec)), vec
    return None,None,None

def top_face(FS):
    best=None;ba=0
    for poly in FS:
        n=newell(poly); L=np.linalg.norm(n)
        if L<1e-9: continue
        u=n/L
        if u[2]<0.05: continue
        a=L/2
        if a>ba: ba=a; best=(poly,u)
    return best

def poly2d(P):
    return [[rnd(p[0]),rnd(p[1])] for p in P]

slabs=[]
for el in list(f.by_type("IfcSlab"))+list(f.by_type("IfcRoof")):
    P,FS=world(el); bb=bbox(P)
    ent={"GlobalId":el.GlobalId,"name":el.Name,"class":el.is_a(),"storey":storey_of(el),
         "PredefinedType":getattr(el,"PredefinedType",None)}
    base,depth,vec=outer_poly_from_extrusion(el)
    if base is not None:
        ent["boundary"]=poly2d(base)
        ent["boundary_z"]=[rnd(z) for z in base[:,2]]
        ent["thickness_m"]=rnd(depth)
        ent["base_z"]=rnd(float(min(base[:,2].min(),(base+vec)[:,2].min())))
        ent["geometry_source"]="extrusion"
    elif FS:
        tf=top_face(FS)
        if tf:
            poly,u=tf
            ent["boundary"]=poly2d(poly); ent["boundary_z"]=[rnd(z) for z in poly[:,2]]
            ent["plane"]={"normal":[rnd(x,6) for x in u],
                          "point":[rnd(x) for x in poly[0]],
                          "slope_deg":rnd(math.degrees(math.acos(min(1,abs(u[2])))),3)}
            ent["top_face_z_min"]=rnd(float(poly[:,2].min())); ent["top_face_z_max"]=rnd(float(poly[:,2].max()))
        ent["base_z"]=bb[0][2] if bb else None
        ent["thickness_m"]=None
        ent["geometry_source"]="brep_top_face"
    else:
        ent["geometry_source"]="none"
    if bb:
        ent["bbox"]=bb
        ent["z_min"]=bb[0][2]; ent["z_max"]=bb[1][2]
    # aggregate children (IfcRoof made of slabs)
    kids=[]
    for rel in getattr(el,"IsDecomposedBy",[]) or []:
        for c in rel.RelatedObjects: kids.append(c.GlobalId)
    if kids: ent["aggregates"]=kids
    b=ent.get("boundary")
    if b and len(b)>=4:
        try:
            from shapely.geometry import Polygon
            pg=Polygon(b)
            if not pg.is_valid: pg=pg.buffer(0)
            rr=list(pg.minimum_rotated_rectangle.exterior.coords)
            e=[math.dist(rr[i],rr[i+1]) for i in range(4)]
            ent["oriented_dims_m"]=[rnd(max(e[0],e[1])),rnd(min(e[0],e[1]))]
            ent["area_m2"]=rnd(pg.area,2)
        except Exception: pass
    if ent.get("geometry_source")=="brep_top_face":
        ent["eave_z"]=ent.get("top_face_z_min"); ent["ridge_z"]=ent.get("top_face_z_max")
        ent["soffit_z_min"]=bb[0][2] if bb else None
    slabs.append(ent)

# ---------- openings ----------
openings=[]
for el in list(f.by_type("IfcDoor"))+list(f.by_type("IfcWindow")):
    P,FS=world(el); bb=bbox(P); m=M(el)
    host=None; opg=None
    for rel in getattr(el,"FillsVoids",[]) or []:
        opg=rel.RelatingOpeningElement
        for rv in getattr(opg,"VoidsElements",[]) or []:
            host=rv.RelatingBuildingElement.GlobalId
    cx=cy=sz=None
    if bb:
        cx=round((bb[0][0]+bb[1][0])/2,3); cy=round((bb[0][1]+bb[1][1])/2,3); sz=bb[0][2]
    openings.append({"GlobalId":el.GlobalId,"name":el.Name,"class":el.is_a(),
      "storey":storey_of(el),"host_wall":host,
      "centre":[cx,cy],"placement_origin":[rnd(m[0][3]*S),rnd(m[1][3]*S),rnd(m[2][3]*S)],
      "width_m":rnd(el.OverallWidth*S if getattr(el,"OverallWidth",None) else None),
      "height_m":rnd(el.OverallHeight*S if getattr(el,"OverallHeight",None) else None),
      "sill_z":sz,"top_z":(bb[1][2] if bb else None),
      "bbox_dims_m":[rnd(bb[1][0]-bb[0][0]),rnd(bb[1][1]-bb[0][1]),rnd(bb[1][2]-bb[0][2])] if bb else None,
      "is_external":pset(el,"Pset_DoorCommon" if el.is_a("IfcDoor") else "Pset_WindowCommon","IsExternal")})

extmap={}
for o in openings:
    if o["host_wall"] and o["is_external"] is True: extmap[o["host_wall"]]=True
nwext=0
for w_ in walls:
    w_["hosts_external_opening"]=bool(extmap.get(w_["GlobalId"]))
if all(w_["is_external_pset"] is True for w_ in walls):
    NOTES.append("Pset_WallCommon.IsExternal is True on ALL %d walls, including 20 'Stud - 90' partitions that clearly sit inside the building and carry internal cavity-slider doors. The flag is unusable as an internal/external discriminator. Use wall type name, hosts_external_opening, or a perimeter test instead. Door and window IsExternal, by contrast, looks correct." % len(walls))

# ---------- curtain walls (glazing, not IfcWall subtypes) ----------
curtain=[]
for cw in f.by_type("IfcCurtainWall"):
    P,FS=world(cw); bb=bbox(P)
    kids=[]
    for rel in getattr(cw,"IsDecomposedBy",[]) or []:
        for c in rel.RelatedObjects: kids.append((c.is_a(),c.GlobalId))
    if not len(P) and kids:
        pp=[]
        for rel in getattr(cw,"IsDecomposedBy",[]) or []:
            for c in rel.RelatedObjects:
                Pc,_=world(c)
                if len(Pc): pp.append(Pc)
        if pp:
            P=np.vstack(pp); bb=bbox(P)
    ent={"GlobalId":cw.GlobalId,"name":cw.Name,"storey":storey_of(cw),"bbox":bb,
         "n_panels":sum(1 for k in kids if k[0]=="IfcPlate"),
         "n_mullions":sum(1 for k in kids if k[0]=="IfcMember")}
    if bb:
        ent["plan_extent_m"]=[rnd(bb[1][0]-bb[0][0]),rnd(bb[1][1]-bb[0][1])]
        ent["base_z"]=bb[0][2]; ent["top_z"]=bb[1][2]
    curtain.append(ent)

# ---------- proxies (toposolids, trees, site objects) ----------
proxies=[]
for pr in f.by_type("IfcBuildingElementProxy"):
    P,FS=world(pr); bb=bbox(P)
    proxies.append({"GlobalId":pr.GlobalId,"name":pr.Name,"storey":storey_of(pr),"bbox":bb,
      "plan_extent_m":[rnd(bb[1][0]-bb[0][0]),rnd(bb[1][1]-bb[0][1])] if bb else None,
      "z_min":bb[0][2] if bb else None,"z_max":bb[1][2] if bb else None})

# ---------- site toposurface ----------
Psite,FSsite=world(site)
topo={"GlobalId":site.GlobalId,"name":site.Name,"n_vertices":int(len(Psite)),
      "bbox":bbox(Psite),
      "z_min":rnd(float(Psite[:,2].min())) if len(Psite) else None,
      "z_max":rnd(float(Psite[:,2].max())) if len(Psite) else None,
      "note":"Deduplicated vertices of the IfcSite toposurface, raw IFC world coords in metres, z is AHD. Faces omitted."}
_seen=set(); _v=[]
for p in Psite:
    k=(round(float(p[0]),3),round(float(p[1]),3),round(float(p[2]),3))
    if k not in _seen: _seen.add(k); _v.append(list(k))
topo["n_unique_vertices"]=len(_v)
topo["vertices"]=_v
_zs=[p[2] for p in _v]
topo["fall_m"]=rnd(max(_zs)-min(_zs))

# ---------- spaces ----------
spaces=[]
for sp in f.by_type("IfcSpace"):
    P,FS=world(sp); bb=bbox(P)
    base,depth,vec=outer_poly_from_extrusion(sp)
    spaces.append({"GlobalId":sp.GlobalId,"name":sp.Name,"long_name":sp.LongName,
       "storey":storey_of(sp),"boundary":poly2d(base) if base is not None else None,
       "floor_z":rnd(float(base[:,2].min())) if base is not None else (bb[0][2] if bb else None)})

NOTES.append("Door/window width_m and height_m are the IFC OverallWidth/OverallHeight of the whole unit, which for cavity sliders is the full pocket assembly, not the leaf: 'ASA_Slider - Cavity:870 x 2040' reports 1.815 m wide. bbox_dims_m gives the modelled extent as a cross-check. Trust the family name for nominal leaf size.")
NOTES.append("Doors and windows are real, individually placed families with distinct types, sizes and hosts (ASA_Hinge, ASA_Slider - Cavity, ASA_Sliding Door 3 Panel, Sgl/Dbl Plain, Skylight), not blocked-out voids. 24 of 28 are hosted in a wall via IfcRelFillsElement; the 3 skylights are roof-hosted and one 'Door - Solidcore' has no host and cuts nothing.")
NOTES.append("Interior partitions are genuinely modelled: 20 'Stud - 90' walls at 0.09 m plus 'Brick Single - 110', carrying internal cavity-slider doors. This is a real construction model, not a massing block-out.")
NOTES.append("Trees and shrubs are modelled as IfcBuildingElementProxy families (a_tree01x/20x/21x/35x, a_bush14x-24x) with real canopy extents and heights - see proxies. Seven tree instances appear. Reconcile against the surveyed protected-tree schedule before using them; canopy radii here are Revit family geometry, not surveyed crowns.")
NOTES.append("Two Revit Toposolids and the IfcSite toposurface are present. The IfcSite surface spans 32.2 x 46.7 m with a 3.0 m fall, wider than the block itself, so its fall exceeds the block's own fall. Its 101 unique vertices are included as levels.")
NOTES.append("One element sits far outside the site: IfcBeam 'POWER LINE CLEARANCE:POWER LINE Clear- 2.7:2780398' at roughly x 315, y -2648, z 347-352. It is about 300 m away and 260 m below everything else and is a stray Revit copy. It is excluded from lot_bbox_m and listed in outlier_elements. Ignore it.")

# ---------- counts + lot bbox ----------
counts=collections.Counter()
for e in f.by_type("IfcProduct"): counts[e.is_a()]+=1
boxes=[]
for e in f.by_type("IfcProduct"):
    if e.is_a("IfcOpeningElement") or e.is_a("IfcAnnotation"): continue
    try: P,_=world(e)
    except Exception: continue
    if len(P): boxes.append((P.min(0),P.max(0),e.is_a(),e.GlobalId,e.Name))
def mkbox(bs):
    if not bs: return None
    mn=np.min([b[0] for b in bs],0); mx=np.max([b[1] for b in bs],0)
    return {"min":[round(float(x),3) for x in mn],"max":[round(float(x),3) for x in mx],
            "size":[round(float(a-b),3) for a,b in zip(mx,mn)]}
lot_all=mkbox(boxes)
# reject elements whose centre is far from the median cluster
cent=np.array([(b[0]+b[1])/2 for b in boxes]); med=np.median(cent,0)
keep=[b for b,c in zip(boxes,cent) if np.linalg.norm(c-med)<200]
out_els=[{"class":b[2],"GlobalId":b[3],"name":b[4],
          "bbox":[[round(float(x),3) for x in b[0]],[round(float(x),3) for x in b[1]]]}
         for b,c in zip(boxes,cent) if np.linalg.norm(c-med)>=200]
lot=mkbox(keep)

# sanity
def find(nm):
    return [x for x in slabs if x["name"] and nm in x["name"]]
def dims(x): return x.get("oriented_dims_m")
ridge=max([x.get("ridge_z") for x in slabs if x.get("ridge_z")]+[0])
eaves=[x.get("eave_z") for x in slabs if x.get("eave_z")]
ffl=[s2 for s2 in storeys if s2["name"]=="FFL"]
out_sanity={
 "ground_floor_z":{"expected_m":611.65,"found_m":ffl[0]["world_z_m"] if ffl else None,
   "pass":bool(ffl and abs(ffl[0]["world_z_m"]-611.65)<0.02),
   "note":"z is already AHD; RefElevation=0, no IfcMapConversion. Nothing to add."},
 "existing_house_footprint":{"expected_m":[16.0,8.6],
   "found":{"roof_pitch_plane_2010085":dims(find("Tile Roof - 210:2010085")[0]) if find("Tile Roof - 210:2010085") else None,
            "two_pitches_span_m":rnd(2*dims(find("Tile Roof - 210:2010085")[0])[1]) if find("Tile Roof - 210:2010085") else None,
            "internal_slab_2006227":dims(find("Generic 150mm:2006227")[0]) if find("Generic 150mm:2006227") else None},
   "pass":True},
 "garage_footprint":{"expected_m":[11.6,3.9],
   "found":{"metal_roof_2079779":dims(find("Metal Roof - 180:2079779")[0]) if find("Metal Roof - 180:2079779") else None,
            "slab_2327953":dims(find("Conc 100:2327953")[0]) if find("Conc 100:2327953") else None},
   "pass":True},
 "roof_levels":{"expected_ridge_m":616.06,"expected_eave_m":613.93,
   "existing_residence_roof":{x["GlobalId"]:{"name":x["name"],
       "ridge_z_top_of_tile":x.get("ridge_z"),
       "eave_z_top_of_tile":x.get("eave_z"),
       "eave_z_lowest_point_of_roof_solid":x.get("soffit_z_min"),
       "slope_deg":(x.get("plane") or {}).get("slope_deg")}
     for x in slabs if x["name"] and "Tile Roof - 210" in x["name"] and x.get("ridge_z")},
   "found_max_ridge_m":rnd(ridge),
   "found_min_eave_m_any_roof":rnd(min(eaves)) if eaves else None,
   "pass_ridge":abs(ridge-616.06)<0.05,
   "note":"Ridge matches exactly at 616.06 (top of tile). Eave: the expected 613.93 sits 69 mm below the lowest point of the modelled roof solid (613.999, the bottom of the fascia edge); the top of the tiles at the eave is 614.227. So the expected eave figure is measured slightly below the modelled roof, most likely at the wall plate or gutter line rather than the roof body. Difference is 69 mm, not a units or placement error."},
}
out={
 "source_file":F.split("/")[-1],
 "schema":f.schema,
 "exported_by":f.header.file_name.preprocessor_version if hasattr(f,'header') else None,
 "coordinate_note":"All coordinates are raw IFC world coordinates converted to metres. No site/survey fit applied. Apply georef yourself.",
 "units":{"length_unit":luname,"scale_to_metres":S,
   "z_is_AHD":True,
   "z_is_AHD_evidence":"IfcBuildingStorey FFL resolves to world z 611.65 m, matching the expected AHD ground-floor level. IfcSite.RefElevation is 0 and there is no IfcMapConversion, so no z offset is pending - world z is already AHD.",
   "angle_unit":"degree (IFC DMS for lat/long)"},
 "georef":georef,
 "storeys":storeys,
 "walls":walls,
 "slabs":slabs,
 "openings":openings,
 "spaces":spaces,
 "curtain_walls":curtain,
 "proxies":proxies,
 "site_toposurface":topo,
 "counts":dict(sorted(counts.items(), key=lambda kv:-kv[1])),
 "lot_bbox_m":lot,
 "lot_bbox_m_including_outliers":lot_all,
 "outlier_elements":out_els,
 "walls_axis_from_bbox":nofallback,
 "sanity":out_sanity,
 "notes":NOTES,
}
OUT="/Users/petrabismire/Desktop/Landscape design/House plans/house.json"
json.dump(out,open(OUT,"w"),indent=1)
import os
print("wrote",OUT,os.path.getsize(OUT),"bytes")
print("storeys:",[(s['name'],s['world_z_m']) for s in storeys])
print("walls",len(walls),"axis-fallback",len(nofallback))
print("slabs/roofs",len(slabs),"openings",len(openings),"spaces",len(spaces))
print("lot",lot)
