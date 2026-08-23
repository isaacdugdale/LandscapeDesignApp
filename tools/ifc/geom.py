import numpy as np, math

def a2p(p):
    M = np.eye(4)
    if p is None: return M
    o = list(p.Location.Coordinates)
    if p.is_a("IfcAxis2Placement2D"):
        o = o + [0.0]
        x = (list(p.RefDirection.DirectionRatios) + [0.0]) if p.RefDirection else [1.,0.,0.]
        z = [0.,0.,1.]
    else:
        z = list(p.Axis.DirectionRatios) if p.Axis else [0.,0.,1.]
        x = list(p.RefDirection.DirectionRatios) if p.RefDirection else [1.,0.,0.]
    z = np.array(z,float); x = np.array(x,float); o = np.array(o,float)
    z /= np.linalg.norm(z)
    x = x - np.dot(x,z)*z
    n = np.linalg.norm(x)
    x = x/n if n > 1e-9 else np.array([1.,0.,0.])
    y = np.cross(z,x)
    M[:3,0]=x; M[:3,1]=y; M[:3,2]=z; M[:3,3]=o
    return M

def cto(op):
    M = np.eye(4)
    if op is None: return M
    o = np.array(list(op.LocalOrigin.Coordinates)+[0.,0.,0.][:3-len(op.LocalOrigin.Coordinates)],float)[:3]
    s = getattr(op,"Scl",None) or getattr(op,"Scale",None) or 1.0
    x = np.array(list(op.Axis1.DirectionRatios),float) if getattr(op,"Axis1",None) else np.array([1.,0.,0.])
    if len(x)==2: x=np.append(x,0.)
    z = None
    if op.is_a("IfcCartesianTransformationOperator3D") and getattr(op,"Axis3",None):
        z = np.array(list(op.Axis3.DirectionRatios),float)
    if z is None: z = np.array([0.,0.,1.])
    x/=np.linalg.norm(x); z/=np.linalg.norm(z)
    x = x - np.dot(x,z)*z; x/=np.linalg.norm(x)
    y = np.cross(z,x)
    M[:3,0]=x*s; M[:3,1]=y*s; M[:3,2]=z*s; M[:3,3]=o
    return M

def xf(M, pts):
    if not len(pts): return np.zeros((0,3))
    P = np.array([list(p)+[0.]*(3-len(p)) for p in pts], float)
    return (M[:3,:3] @ P.T).T + M[:3,3]

def crv_pts(c):
    """local 2D/3D points of a curve"""
    if c is None: return []
    if c.is_a("IfcPolyline"):
        return [p.Coordinates for p in c.Points]
    if c.is_a("IfcCompositeCurve"):
        out=[]
        for seg in c.Segments:
            out += crv_pts(seg.ParentCurve)
        return out
    if c.is_a("IfcTrimmedCurve"):
        b = c.BasisCurve
        if b.is_a("IfcCircle"):
            M = a2p(b.Position); r = b.Radius
            t=[]
            for tr in (c.Trim1, c.Trim2):
                v=None
                for it in (tr or []):
                    if hasattr(it,"is_a"):
                        if it.is_a("IfcCartesianPoint"): continue
                        try: v=float(it.wrappedValue)
                        except Exception: pass
                        continue
                    try: v=float(it)
                    except Exception: pass
                t.append(0.0 if v is None else v)
            a0,a1 = math.radians(t[0]), math.radians(t[1])
            if not c.SenseAgreement: a0,a1=a1,a0
            if a1 < a0: a1 += 2*math.pi
            n=max(4,int(abs(a1-a0)/0.35)+1)
            loc=[(r*math.cos(a0+(a1-a0)*i/n), r*math.sin(a0+(a1-a0)*i/n),0.) for i in range(n+1)]
            return [tuple(p) for p in xf(M, loc)]
        if b.is_a("IfcLine"):
            pts=[]
            for tr in (c.Trim1,c.Trim2):
                for it in tr:
                    if hasattr(it,"is_a") and it.is_a("IfcCartesianPoint"): pts.append(it.Coordinates)
            return pts
        return crv_pts(b)
    if c.is_a("IfcCircle"):
        M=a2p(c.Position); r=c.Radius
        return [tuple(p) for p in xf(M,[(r*math.cos(a),r*math.sin(a),0.) for a in np.linspace(0,2*math.pi,17)])]
    return []

def prof_pts(pr):
    if pr is None: return []
    if pr.is_a("IfcArbitraryClosedProfileDef"):
        return crv_pts(pr.OuterCurve)
    if pr.is_a("IfcRectangleProfileDef"):
        X,Y = pr.XDim/2, pr.YDim/2
        M = a2p(pr.Position) if pr.Position else np.eye(4)
        return [tuple(p) for p in xf(M,[(-X,-Y,0),(X,-Y,0),(X,Y,0),(-X,Y,0),(-X,-Y,0)])]
    if pr.is_a("IfcCircleProfileDef"):
        M = a2p(pr.Position) if pr.Position else np.eye(4); r=pr.Radius
        return [tuple(p) for p in xf(M,[(r*math.cos(a),r*math.sin(a),0.) for a in np.linspace(0,2*math.pi,17)])]
    if pr.is_a("IfcCompositeProfileDef"):
        o=[]
        for p in pr.Profiles: o+=prof_pts(p)
        return o
    if pr.is_a("IfcDerivedProfileDef"):
        base = prof_pts(pr.ParentProfile)
        M = cto(pr.Operator)
        return [tuple(p) for p in xf(M, base)]
    if hasattr(pr,"OuterCurve"): return crv_pts(pr.OuterCurve)
    return []

def collect(item, M, pts, faces, depth=0):
    """append world points, and world face polygons (for breps)"""
    if item is None or depth>12: return
    t = item.is_a()
    if t == "IfcMappedItem":
        M2 = M @ cto(item.MappingTarget) @ a2p(item.MappingSource.MappingOrigin)
        for i in item.MappingSource.MappedRepresentation.Items:
            collect(i, M2, pts, faces, depth+1)
        return
    if t in ("IfcBooleanClippingResult","IfcBooleanResult"):
        collect(item.FirstOperand, M, pts, faces, depth+1); return
    if t in ("IfcFacetedBrep","IfcAdvancedBrep","IfcManifoldSolidBrep"):
        collect(item.Outer, M, pts, faces, depth+1); return
    if t in ("IfcClosedShell","IfcOpenShell","IfcConnectedFaceSet"):
        for fc in item.CfsFaces: collect(fc, M, pts, faces, depth+1)
        return
    if t == "IfcFaceBasedSurfaceModel":
        for s in item.FbsmFaces: collect(s, M, pts, faces, depth+1)
        return
    if t == "IfcShellBasedSurfaceModel":
        for s in item.SbsmBoundary: collect(s, M, pts, faces, depth+1)
        return
    if t in ("IfcFace","IfcAdvancedFace"):
        for b in item.Bounds:
            if b.is_a("IfcFaceOuterBound") or len(item.Bounds)==1:
                poly = b.Bound.Polygon if b.Bound.is_a("IfcPolyLoop") else []
                w = xf(M,[p.Coordinates for p in poly])
                if len(w)>=3:
                    faces.append(w); pts.extend(w.tolist())
        return
    if t == "IfcExtrudedAreaSolid":
        M2 = M @ a2p(item.Position)
        base = xf(M2, prof_pts(item.SweptArea))
        d = np.array(item.ExtrudedDirection.DirectionRatios,float)
        vec = (M2[:3,:3] @ d) * item.Depth
        pts.extend(base.tolist()); pts.extend((base+vec).tolist())
        return
    if t in ("IfcSweptDiskSolid","IfcRevolvedAreaSolid","IfcSurfaceCurveSweptAreaSolid"):
        M2 = M @ a2p(item.Position) if getattr(item,"Position",None) else M
        pts.extend(xf(M2, prof_pts(item.SweptArea)).tolist()); return
    if t == "IfcGeometricSet" or t=="IfcGeometricCurveSet":
        for e in item.Elements: collect(e, M, pts, faces, depth+1)
        return
    if t == "IfcPolyline":
        pts.extend(xf(M,[p.Coordinates for p in item.Points]).tolist()); return
    if t in ("IfcTrimmedCurve","IfcCompositeCurve","IfcCircle"):
        pts.extend(xf(M, crv_pts(item)).tolist()); return
    if t == "IfcPolygonalBoundedHalfSpace" or t=="IfcHalfSpaceSolid":
        return
    return

def newell(poly):
    n=np.zeros(3)
    for i in range(len(poly)):
        a,b = poly[i], poly[(i+1)%len(poly)]
        n[0]+=(a[1]-b[1])*(a[2]+b[2]); n[1]+=(a[2]-b[2])*(a[0]+b[0]); n[2]+=(a[0]-b[0])*(a[1]+b[1])
    return n
